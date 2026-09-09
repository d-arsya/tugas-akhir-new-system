import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter"
import * as handlebars from "handlebars"
import * as fs from "node:fs"
import * as path from "node:path"

const EMBEDDED_TEMPLATES: Record<string, string> = {
	"registrant-password": `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<title>Akun Pendaftaran Santri Baru</title>
	<style>
		body { font-family: 'Montserrat', Arial, sans-serif; background-color: #ecedf0; margin: 0; padding: 20px; color: #4b4b4b; }
		.container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
		.header { text-align: center; margin-bottom: 24px; }
		.header h1 { font-size: 22px; color: #17283c; margin: 0 0 6px; }
		.info-box { background: #f7f7f7; border-left: 4px solid #e4007e; padding: 16px; border-radius: 6px; margin: 20px 0; }
		.cred-label { font-size: 11px; color: #777777; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
		.cred-val { font-size: 16px; font-weight: 700; color: #17283c; font-family: monospace; }
		.btn { display: inline-block; background-color: #e4007e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; margin-top: 16px; text-align: center; }
		.footer { font-size: 11px; color: #abb4be; text-align: center; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Penerimaan Santri Baru</h1>
			<p>Pondok Roja</p>
		</div>
		<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
		<p>Halo <strong>{{fullName}}</strong>, pendaftaran calon santri baru Anda telah berhasil kami terima.</p>
		<div class="info-box">
			<div class="cred-label">Nomor Pendaftaran</div>
			<div class="cred-val">{{registrantId}}</div>
			<div style="margin-top: 12px;" class="cred-label">Password Akun Anda</div>
			<div class="cred-val">{{password}}</div>
		</div>
		<p>Silakan gunakan email dan password di atas untuk masuk ke dashboard PSB dan memantau status validasi data Anda.</p>
		<div style="text-align: center;">
			<a href="{{loginUrl}}" class="btn">Masuk ke Dashboard PSB</a>
		</div>
		<div class="footer">
			&copy; Pondok Roja. Pesan ini dikirim secara otomatis oleh sistem.
		</div>
	</div>
</body>
</html>`,
	"email-verification": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verifikasi Email</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Klik tombol berikut untuk memverifikasi alamat email Anda:</p>
  <a href="{{verifyUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Verifikasi Email
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Jika Anda tidak mendaftar, abaikan email ini.</p>
</body>
</html>`,
	"forgot-password": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Reset Password</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Anda meminta reset password. Klik tombol berikut:</p>
  <a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Reset Password
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Link ini berlaku 60 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
</body>
</html>`,
	"reset-pin": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Reset PIN E-Wallet</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Anda meminta reset PIN E-Wallet. Klik tombol berikut:</p>
  <a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#e4007e;color:#fff;text-decoration:none;border-radius:6px;">
    Reset PIN
  </a>
  <p style="margin-top:20px;font-size:12px;color:#abb4be;">Link ini berlaku 60 menit.</p>
</body>
</html>`,
	"two-factor": `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Kode 2FA</title></head>
<body style="font-family: Montserrat, sans-serif; color: #4b4b4b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo, {{name}}!</h2>
  <p>Kode verifikasi 2FA Anda:</p>
  <div style="font-size:36px;font-weight:bold;color:#e4007e;letter-spacing:8px;margin:20px 0;">{{code}}</div>
  <p style="font-size:12px;color:#abb4be;">Kode ini berlaku 10 menit.</p>
</body>
</html>`,
}

export class SafeHandlebarsAdapter extends HandlebarsAdapter {
	public override compile(mail: any, callback: (err?: any, body?: string) => void, mailerOptions: any): void {
		const rawTemplateName = mail?.data?.template ?? ""
		const templateExt = path.extname(rawTemplateName) || ".hbs"
		const templateName = path.basename(rawTemplateName, templateExt)

		// Candidate directories to search for template files
		const candidateDirs = [
			mailerOptions?.template?.dir,
			path.join(__dirname, "templates"),
			path.join(__dirname, "../templates"),
			path.join(__dirname, "src/core/mailer/templates"),
			path.join(process.cwd(), "dist/apps/api/templates"),
			path.join(process.cwd(), "apps/api/src/core/mailer/templates"),
			path.join(process.cwd(), "templates"),
			path.join(process.cwd(), "src/core/mailer/templates"),
		].filter(Boolean) as string[]

		// Set dirs list in mailerOptions so parent class can try alternate directories if needed
		if (mailerOptions && mailerOptions.template) {
			mailerOptions.template.dirs = Array.from(new Set(candidateDirs))
		}

		// Find first existing template file directory
		let foundDir: string | undefined
		for (const dir of candidateDirs) {
			const fullPath = path.join(dir, templateName + templateExt)
			if (fs.existsSync(fullPath)) {
				foundDir = dir
				break
			}
		}

		if (foundDir && mailerOptions?.template) {
			mailerOptions.template.dir = foundDir
			try {
				return super.compile(mail, callback, mailerOptions)
			} catch (_err) {
				// Fall through to embedded template if super.compile fails
			}
		}

		// Fallback: render from embedded template string if file not found on disk
		const fallbackSource = EMBEDDED_TEMPLATES[templateName]
		if (fallbackSource) {
			try {
				const compiled = handlebars.compile(fallbackSource)
				const rendered = compiled(mail?.data?.context ?? {})

				mail.data.html = rendered
				return callback()
			} catch (err) {
				return callback(err)
			}
		}

		// If no embedded template, attempt standard compile as last resort
		return super.compile(mail, callback, mailerOptions)
	}
}

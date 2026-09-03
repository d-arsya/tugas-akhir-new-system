import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import LocationSelect from '@/components/location-select';

// Form data shape
interface FormValues {
  provinceId: number;
  regencyId: number;
  districtId: number;
  villageId: number; // API‑selected village (0 = none)
  villageNameManual?: string; // manual entry when village not listed
  villagePostalCodeManual?: string;
}

/**
 * Registration step – collect full location hierarchy.
 * Includes a fallback for manual village entry when the API does not provide the user's village.
 */
const RegisterLocationStep: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      provinceId: 0,
      regencyId: 0,
      districtId: 0,
      villageId: 0,
      villageNameManual: '',
      villagePostalCodeManual: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Validation: either a village is selected or manual fields are filled
    const villageSelected = data.villageId && data.villageId !== 0;
    const manualFilled =
      data.villageNameManual?.trim() && data.villagePostalCodeManual?.trim();
    if (!villageSelected && !manualFilled) {
      alert('Pilih desa dari daftar atau isi nama dan kode pos secara manual.');
      return;
    }
    // For now just log the payload – replace with actual API call if needed
    console.log('Location payload:', data);
    alert('Data lokasi berhasil disimpan');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-semibold mb-4">Langkah 1 – Pilih Lokasi</h2>
      <LocationSelect
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        provinceLabel="Provinsi"
        regencyLabel="Kabupaten/Kota"
        districtLabel="Kecamatan"
        // optional custom label for village – defaults to "Desa"
        // villageLabel="Desa"
      />
      {/* Hidden field for auto-filled postal code */}
      <input type="hidden" {...register('villagePostalCodeManual')} />
      {/* Display any generic form errors */}
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger mt-3">
          Harap periksa kembali input yang ditandai merah.
        </div>
      )}
      <button type="submit" className="btn btn-primary mt-4">
        Selanjutnya
      </button>
    </form>
  );
};

export default RegisterLocationStep;

import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import am4themesAnimated from "@amcharts/amcharts4/themes/animated"

am4core.useTheme(am4themesAnimated)

export { am4charts, am4core }

export const styleLegacyTooltip = (tooltip: am4core.Tooltip | undefined): void => {
	if (!tooltip) return
	tooltip.getFillFromObject = false
	tooltip.background.fill = am4core.color("#E4007E")
	tooltip.background.strokeWidth = 1
	tooltip.label.padding(10, 16, 10, 16)
	tooltip.background.cornerRadius = 8

	const shadow = tooltip.background.filters.getIndex(0)
	if (shadow instanceof am4core.DropShadowFilter) {
		shadow.dx = 0
		shadow.dy = 5
		shadow.blur = 8
		shadow.color = am4core.color("#E4007E")
	}
}

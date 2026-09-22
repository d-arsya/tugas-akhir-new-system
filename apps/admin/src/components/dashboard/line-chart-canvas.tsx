import { useEffect, useRef, type JSX } from "react"

import type { DashboardChartItem } from "@roja/types"

import { am4charts, am4core, styleLegacyTooltip } from "@/lib/amcharts"

type LineChartCanvasProps = { data: DashboardChartItem[] }

// Port of legacy public/assets/js/dashboard/line-chart.js (amCharts 4)
const LineChartCanvas = ({ data }: LineChartCanvasProps): JSX.Element => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<am4charts.XYChart | null>(null)

	useEffect(() => {
		if (!containerRef.current) return
		const style = getComputedStyle(document.body)
		const textColor = am4core.color(style.getPropertyValue("--body-txt-inverse").trim())
		const chart = am4core.create(containerRef.current, am4charts.XYChart)

		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
		categoryAxis.startLocation = 0.2
		categoryAxis.endLocation = 0.8
		categoryAxis.dataFields.category = "category"
		categoryAxis.renderer.grid.template.strokeWidth = 0
		categoryAxis.renderer.minGridDistance = 50
		categoryAxis.renderer.labels.template.fill = textColor
		valueAxis.min = 0
		valueAxis.renderer.grid.template.strokeWidth = 0
		valueAxis.renderer.labels.template.fill = textColor

		const series = chart.series.push(new am4charts.LineSeries())
		series.stroke = am4core.color("#E4007E")
		series.dataFields.valueY = "value"
		series.dataFields.categoryX = "category"
		series.strokeWidth = 3
		series.minBulletDistance = 15
		series.fillOpacity = 1
		series.tensionX = 0.6

		const gradient = new am4core.LinearGradient()
		gradient.addColor(am4core.color("rgba(255, 255, 255, 0)"))
		gradient.addColor(am4core.color("rgba(217, 2, 122, 0.3)"))
		gradient.rotation = -90
		series.fill = gradient

		const bullet = series.bullets.push(new am4charts.CircleBullet())
		bullet.circle.strokeWidth = 3
		bullet.circle.radius = 5
		bullet.circle.fill = am4core.color(style.getPropertyValue("--bg-inverse").trim())
		bullet.states.create("hover").properties.scale = 1.3

		const cursor = new am4charts.XYCursor()
		cursor.behavior = "panXY"
		cursor.xAxis = categoryAxis
		cursor.snapToSeries = series
		chart.cursor = cursor

		// Same template-literal text (incl. indentation) as legacy
		series.tooltipText = `Total Santri
    {valueY}`
		series.name = "Total Santri"
		styleLegacyTooltip(series.tooltip)
		if (series.tooltip) series.tooltip.pointerOrientation = "horizontal"

		chartRef.current = chart
		return () => {
			chart.dispose()
			chartRef.current = null
		}
	}, [])

	useEffect(() => {
		if (chartRef.current) chartRef.current.data = data
	}, [data])

	return <div ref={containerRef} className="min-h-[380px]" />
}

export default LineChartCanvas

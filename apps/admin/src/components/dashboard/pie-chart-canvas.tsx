import { useEffect, useRef, type JSX } from "react"

import type { DashboardPieItem } from "@roja/types"

import { am4charts, am4core, styleLegacyTooltip } from "@/lib/amcharts"

type PieChartCanvasProps = { data: DashboardPieItem[] }

const PIE_COLORS = ["#E4007E", "#E93297", "#EC4BA4", "#EE65B1", "#F17EBD", "#F498CB", "#F6B1D7", "#F9CBE4", "#FCE4F1"]

const PieChartCanvas = ({ data }: PieChartCanvasProps): JSX.Element => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<am4charts.PieChart | null>(null)

	useEffect(() => {
		if (!containerRef.current) return
		const style = getComputedStyle(document.body)
		const chart = am4core.create(containerRef.current, am4charts.PieChart)

		const pieSeries = chart.series.push(new am4charts.PieSeries())
		pieSeries.dataFields.value = "value"
		pieSeries.dataFields.category = "grade"
		pieSeries.slices.template.stroke = am4core.color(style.getPropertyValue("--bg-inverse").trim())
		pieSeries.slices.template.strokeWidth = 1
		pieSeries.slices.template.strokeOpacity = 1
		pieSeries.slices.template.cornerRadius = 6

		const hover = pieSeries.slices.template.states.getKey("hover")
		if (hover) hover.properties.scale = 1.1

		pieSeries.labels.template.disabled = true
		pieSeries.ticks.template.disabled = true

		pieSeries.hiddenState.properties.opacity = 1
		pieSeries.hiddenState.properties.endAngle = -90
		pieSeries.hiddenState.properties.startAngle = -90
		chart.hiddenState.properties.radius = am4core.percent(0)

		const legend = new am4charts.Legend()
		legend.position = "right"
		legend.labels.template.fill = am4core.color(style.getPropertyValue("--body-txt-inverse").trim())
		chart.legend = legend

		const marker = legend.markers.template.children.getIndex(0)
		if (marker instanceof am4core.RoundedRectangle) {
			marker.cornerRadius(4, 4, 4, 4)
			marker.width = 18
			marker.height = 18
			marker.strokeWidth = 0
			marker.strokeOpacity = 0
		}
		legend.valueLabels.template.disabled = true

		pieSeries.colors.list = PIE_COLORS.map((color) => am4core.color(color))

		styleLegacyTooltip(pieSeries.tooltip)
		if (pieSeries.tooltip) {
			pieSeries.tooltip.autoTextColor = false
			pieSeries.tooltip.label.fill = am4core.color("#FFFFFF")
		}

		chartRef.current = chart
		return () => {
			chart.dispose()
			chartRef.current = null
		}
	}, [])

	useEffect(() => {
		if (chartRef.current) chartRef.current.data = data
	}, [data])

	return <div ref={containerRef} className="min-h-[350px]" />
}

export default PieChartCanvas

import { JSX, useEffect, useRef } from "react";
import UPlot from "uplot";
import { IHistoryEntry } from "../../../types";
import { GraphsPlugins_zoom } from "../../../utils/graphsPlugins";
import { Tailwind_semantic } from "../../../utils/tailwindConfig";

interface IProgramDetailsExerciseExampleGraphProps {
  title: string;
  yAxisLabel: string;
  color: string;
  weeksData: { label: string; entry: IHistoryEntry }[];
  getValue: (entry: IHistoryEntry) => number;
}

export function ProgramDetailsExerciseExampleGraph(props: IProgramDetailsExerciseExampleGraphProps): JSX.Element {
  const graphRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!graphRef.current) {
      return;
    }
    const rect = graphRef.current.getBoundingClientRect();
    // personal-fork: uplot paints axes on canvas, so the theme colors go in here; the empty "Week: --" legend is hidden
    const semantic = Tailwind_semantic();
    const axis = {
      stroke: semantic.text.secondary,
      grid: { stroke: semantic.border.neutral },
      ticks: { stroke: semantic.border.neutral },
    };
    const opts: UPlot.Options = {
      title: props.title,
      class: "graph-program-details-example",
      width: rect.width,
      height: rect.height,
      cursor: {
        y: false,
        lock: true,
      },
      legend: {
        show: false,
      },
      series: [
        {
          label: "Week",
        },
        {
          label: props.yAxisLabel,
          value: (self, rawValue) => rawValue,
          stroke: props.color,
          width: 1,
          spanGaps: true,
        },
      ],
      plugins: [GraphsPlugins_zoom()],
      scales: {
        x: {
          time: false,
        },
      },
      axes: [
        {
          ...axis,
          space: 20,
          incrs: [1],
        },
        axis,
      ],
    };

    const weekNumbers = props.weeksData.map((weekData) => {
      const match = weekData.label.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });

    const data: [number[], number[]] = [
      weekNumbers,
      props.weeksData.map((weekData) => {
        return props.getValue(weekData.entry);
      }),
    ];

    const uplot = new UPlot(opts, data, graphRef.current!);

    const underEl = graphRef.current!.querySelector(".over");
    const underRect = underEl?.getBoundingClientRect();

    function handler(): void {
      function onMove(event: TouchEvent): void {
        const offset = window.pageYOffset;
        const touch = event.touches[0];
        uplot.setCursor({ left: touch.clientX - underRect!.left, top: touch.clientY - underRect!.top + offset });
      }

      function onEnd(): void {
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      }

      window.addEventListener("touchmove", onMove);
      window.addEventListener("touchend", onEnd);
    }

    if (underEl != null) {
      underEl.addEventListener("touchstart", handler);
    }
  }, []);

  return (
    <div className="relative z-0 pt-2" data-testid="graph">
      <div className="w-full" data-testid="graph-data" style={{ height: "10em" }} ref={graphRef}></div>
      <div data-testid="graph-legend" className="box-content px-8 pt-8 pb-2 text-sm" ref={legendRef}></div>
    </div>
  );
}

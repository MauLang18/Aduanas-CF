import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import TitleCard from "../../../components/Cards/TitleCard";
import { useRef } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ data, title, onSliceClick }) {
  const chartRef = useRef();

  const labels = data.map((item) => item.label);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Cantidad de Cargas",
        data: data.map((item) => item.value),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleClick = (event) => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      const elements = chartInstance.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        true
      );
      if (elements.length > 0) {
        const elementIndex = elements[0].index; // Índice del sector clicado
        const clickedLabel = labels[elementIndex];
        const clickedValue = chartData.datasets[0].data[elementIndex];

        if (onSliceClick) {
          onSliceClick({ label: clickedLabel, value: clickedValue });
        }
      }
    }
  };

  return (
    <TitleCard title={title}>
      <Doughnut ref={chartRef} data={chartData} onClick={handleClick} />
    </TitleCard>
  );
}

export default DoughnutChart;
//

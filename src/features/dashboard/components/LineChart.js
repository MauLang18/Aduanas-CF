import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function LineChart({ data, title }) {
  const labels = data.map(item => item.label);
  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Cantidad de Cargas',
        data: data.map(item => item.value),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      },
    },
  };

  return (
    <TitleCard title={title}>
      <Line data={chartData} options={options} />
    </TitleCard>
  );
}

export default LineChart;

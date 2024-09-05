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

function LineChart({ data }) {
  const labels = data.map(item => new Date(item.new_eta).toLocaleDateString()); 
  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'ETA Dates',
        data: data.map(item => item.new_cantequipo),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <TitleCard title={"ETA Dates Overview"}>
      <Line data={chartData} options={options} />
    </TitleCard>
  );
}

export default LineChart;

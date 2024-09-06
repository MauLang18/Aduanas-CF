import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data, title }) {
  const labels = data.map(item => item.label); // Utiliza el 'label' pasado en los datos
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cantidad de Cargas',
        data: data.map(item => item.value), // Utiliza el 'value' pasado en los datos
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
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
      <Bar options={options} data={chartData} />
    </TitleCard>
  );
}

export default BarChart;

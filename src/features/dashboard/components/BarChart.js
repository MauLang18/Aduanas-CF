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

function BarChart({ data }) {
    const labels = data.map(item => item.new_commodity); 
    const chartData = {
        labels,
        datasets: [
          {
            label: 'Container Count',
            data: data.map(item => item.new_cantequipo),
            backgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
      };

    return(
      <TitleCard title={"Container Count per Commodity"}>
            <Bar options={options} data={chartData} />
      </TitleCard>
    );
}

export default BarChart;

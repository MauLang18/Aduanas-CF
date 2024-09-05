import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showNotification } from '../common/headerSlice';

import DashboardStats from './components/DashboardStats';
import AmountStats from './components/AmountStats';
import PageStats from './components/PageStats';

import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';

import UserChannels from './components/UserChannels';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import DoughnutChart from './components/DoughnutChart';
import DashboardTopBar from './components/DashboardTopBar';

function Dashboard() {
    const dispatch = useDispatch();
    const [chartData, setChartData] = useState([]);

    const updateDashboardPeriod = (newRange) => {
        dispatch(showNotification({ message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status: 1 }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5218/api/TransInternacional?numFilter=0');
                const filteredData = response.data.data.value.filter(item => item.new_eta);
                setChartData(filteredData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Definir statsData
    const statsData = [
        {
            title: 'Users',
            value: '24k',
            icon: <UserGroupIcon className="w-8 h-8 text-indigo-500" />,
        },
        {
            title: 'Active Users',
            value: '12k',
            icon: <UsersIcon className="w-8 h-8 text-green-500" />,
        },
        {
            title: 'Revenue',
            value: '$120k',
            icon: <CircleStackIcon className="w-8 h-8 text-yellow-500" />,
        },
        {
            title: 'Expenses',
            value: '$80k',
            icon: <CreditCardIcon className="w-8 h-8 text-red-500" />,
        },
    ];

    return (
        <>
            
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {
                    statsData.map((d, k) => (
                        <DashboardStats key={k} {...d} colorIndex={k} />
                    ))
                }
            </div>
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <LineChart data={chartData} />
                <BarChart data={chartData} />
            </div>
            <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
                <AmountStats />
                <PageStats />
            </div>
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <UserChannels />
                <DoughnutChart data={chartData} />
            </div>
        </>
    );
}

export default Dashboard;

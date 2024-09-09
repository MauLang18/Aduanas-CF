import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showNotification } from "../common/headerSlice";
import moment from "moment"; // Para manipulación de fechas

import DashboardStats from "./components/DashboardStats";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import DoughnutChart from "./components/DoughnutChart";

// Importación de los íconos
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import CreditCardIcon from "@heroicons/react/24/outline/CreditCardIcon";

// Importación de mappings
import polMapping from "../../data/pol.json";
import poeMapping from "../../data/poe.json";
import statusMapping from "../../data/status.json";
import cantEquipoMapping from "../../data/cantEquipo.json";
import tamanoEquipoMapping from "../../data/tamanoEquipo.json";
import ejecutivoMapping from "../../data/ejecutivo.json";

const getPolName = (pol) => {
  return polMapping[pol] || "";
};
const getPoeName = (poe) => {
  return poeMapping[poe] || "";
};
const getStatusName = (status) => {
  return statusMapping[status] || "";
};
const getCantEquipoName = (cantEquipo) => {
  return cantEquipoMapping[cantEquipo] || "";
};
const getTamanoEquipoName = (tamanoEquipo) => {
  return tamanoEquipoMapping[tamanoEquipo] || "";
};
const getEjecutivoName = (ejecutivo) => {
  return ejecutivoMapping[ejecutivo] || "";
};

function Dashboard() {
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({
    executive: {},
    client: {},
    status: {},
    pol: {},
    poe: {},
  });
  const [todayStats, setTodayStats] = useState(0);
  const [weekStats, setWeekStats] = useState(0);
  const [monthStats, setMonthStats] = useState(0);
  const [totalStats, setTotalStats] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.logisticacastrofallas.com/api/TransInternacional?numFilter=0"
        );
        const filteredData = response.data.data.value;

        // Filtrar los datos con ETA válida o sin ETA
        const excludedStatuses = [100000012, 100000023, 100000010, 100000022, 100000021, 100000019];
        const validFilteredData = filteredData.filter(
          (item) =>
            (!item.new_eta || moment(item.new_eta).isSameOrAfter(moment())) &&
            !excludedStatuses.includes(item.new_preestado2)
        );

        // Filtrar y calcular estadísticas
        const today = moment().startOf("day");
        const endOfToday = moment().endOf("day");
        const startOfWeek = moment().startOf("week").startOf("day");
        const endOfWeek = moment().endOf("week").endOf("day");
        const startOfMonth = moment().startOf("month").startOf("day");
        const endOfMonth = moment().endOf("month").endOf("day");

        const todayCount = validFilteredData.filter((item) =>
          moment(item.new_eta).isBetween(today, endOfToday, null, "[]")
        ).length;
        const weekCount = validFilteredData.filter((item) =>
          moment(item.new_eta).isBetween(startOfWeek, endOfWeek, null, "[]")
        ).length;
        const monthCount = validFilteredData.filter((item) =>
          moment(item.new_eta).isBetween(startOfMonth, endOfMonth, null, "[]")
        ).length;
        const totalCount = validFilteredData.length;

        setTodayStats(todayCount);
        setWeekStats(weekCount);
        setMonthStats(monthCount);
        setTotalStats(totalCount);

        // Agrupar datos para gráficos
        const groupBy = (arr, key) =>
          arr.reduce((acc, item) => {
            const groupValue = item[key];
            if (groupValue !== undefined && groupValue !== null) {
              acc[groupValue] = (acc[groupValue] || 0) + 1;
            }
            return acc;
          }, {});

        const groupedData = {
          executive: groupBy(
            validFilteredData,
            "new_ejecutivocomercial"
          ),
          client: groupBy(
            validFilteredData,
            "_customerid_value"
          ),
          status: groupBy(
            validFilteredData,
            "new_preestado2"
          ),
          pol: groupBy(
            validFilteredData,
            "new_pol"
          ),
          poe: groupBy(
            validFilteredData,
            "new_poe"
          ),
        };

        setChartData(groupedData);

        console.log(chartData.executive);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Definir statsData para las estadísticas
  const statsData = [
    {
      title: "Cargas Hoy",
      value: todayStats,
      icon: <UserGroupIcon className="w-8 h-8 text-indigo-500" />,
    },
    {
      title: "Cargas Semana",
      value: weekStats,
      icon: <UsersIcon className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Cargas Mes",
      value: monthStats,
      icon: <CircleStackIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Total Cargas",
      value: totalStats,
      icon: <CreditCardIcon className="w-8 h-8 text-red-500" />,
    },
  ];

  const isChartDataReady = Object.keys(chartData).length > 0;

  return (
    <>
      {/* Mostrar estadísticas */}
      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {statsData.map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
      </div>

      {/* Gráficos */}
      {isChartDataReady && (
        <>
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <DoughnutChart
              title="Cargas por Ejecutivo"
              data={Object.keys(chartData.executive || {})
                .map((ejecutivo) => ({
                  label: getEjecutivoName(ejecutivo),
                  value: chartData.executive[ejecutivo],
                }))
                .filter((item) => item.label && item.value !== undefined)}
            />
            <DoughnutChart
              title="Cargas por Cliente"
              data={Object.keys(chartData.client || {})
                .map((client) => ({
                  label: client,
                  value: chartData.client[client],
                }))
                .filter((item) => item.label && item.value !== undefined)}
            />
          </div>
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <BarChart
              title="Cargas por Preestado"
              data={Object.keys(chartData.status || {})
                .map((status) => ({
                  label: getStatusName(status),
                  value: chartData.status[status],
                }))
                .filter((item) => item.label && item.value !== undefined)}
            />
            <LineChart
              title="Cargas por POE"
              data={Object.keys(chartData.poe || {})
                .map((poe) => ({
                  label: `POE: ${getPoeName(poe)}`,
                  value: chartData.poe[poe],
                }))
                .filter((item) => item.label && item.value !== undefined)}
            />
          </div>
        </>
      )}
    </>
  );
}

export default Dashboard;

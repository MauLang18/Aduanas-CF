import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useDispatch } from "react-redux";
import { showNotification } from "../common/headerSlice";

// Componentes
import DashboardStats from "./components/DashboardStats";
import DoughnutChart from "./components/DoughnutChart";
import Modal from "./components/Modal";
import DataTable from "./components/DataTable";

// Íconos
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import CreditCardIcon from "@heroicons/react/24/outline/CreditCardIcon";

// Mapeos
import polMapping from "../../data/pol.json";
import poeMapping from "../../data/poe.json";
import statusMapping from "../../data/status.json";
import ejecutivoMapping from "../../data/ejecutivo.json";

const getPolName = (pol) => polMapping[pol] || "";
const getPoeName = (poe) => poeMapping[poe] || "";
const getStatusName = (status) => statusMapping[status] || "";
const getEjecutivoName = (ejecutivo) => ejecutivoMapping[ejecutivo] || "";

function Dashboard() {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState([]);
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

  // Estado para el modal
  const [selectedData, setSelectedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.logisticacastrofallas.com/api/TransInternacional?numFilter=0"
        );
        const data = response.data.data.value;

        // Filtrar datos válidos
        const excludedStatuses = [
          100000012, 100000023, 100000010, 100000022, 100000021, 100000019,
        ];
        const validData = data.filter(
          (item) =>
            (!item.new_eta || moment(item.new_eta).isSameOrAfter(moment())) &&
            !excludedStatuses.includes(item.new_preestado2)
        );

        setFilteredData(validData);

        // Estadísticas
        const today = moment().startOf("day");
        const endOfToday = moment().endOf("day");
        const startOfWeek = moment().startOf("week");
        const endOfWeek = moment().endOf("week");
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");

        setTodayStats(
          validData.filter((item) =>
            moment(item.new_eta).isBetween(today, endOfToday, null, "[]")
          ).length
        );
        setWeekStats(
          validData.filter((item) =>
            moment(item.new_eta).isBetween(startOfWeek, endOfWeek, null, "[]")
          ).length
        );
        setMonthStats(
          validData.filter((item) =>
            moment(item.new_eta).isBetween(startOfMonth, endOfMonth, null, "[]")
          ).length
        );
        setTotalStats(validData.length);

        // Agrupar datos para gráficos
        const groupBy = (arr, key) =>
          arr.reduce((acc, item) => {
            const groupValue = item[key];
            if (groupValue !== undefined) {
              acc[groupValue] = (acc[groupValue] || 0) + 1;
            }
            return acc;
          }, {});

        setChartData({
          executive: groupBy(validData, "new_ejecutivocomercial"),
          client: groupBy(validData, "_customerid_value"),
          status: groupBy(validData, "new_preestado2"),
          pol: groupBy(validData, "new_pol"),
          poe: groupBy(validData, "new_poe"),
        });
      } catch (error) {
        dispatch(
          showNotification({ message: "Error fetching data", type: "error" })
        );
      }
    };

    fetchData();
  }, [dispatch]);

  // Manejar clic en las ruletas
  const handleCircleClick = (type, data) => {
    let filtered;
    console.log(data);
    if (type === "executive") {
      filtered = filteredData.filter(
        (item) => getEjecutivoName(item.new_ejecutivocomercial) === data.label
      );
      setTableTitle(`Trámites para Ejecutivo: ${data.label}`);
    } else if (type === "client") {
      filtered = filteredData.filter(
        (item) => item._customerid_value === data.label
      );
      setTableTitle(`Trámites para Cliente: ${data.label}`);
    }

    // Verifica que filtered tenga datos
    if (!filtered || filtered.length === 0) {
      setSelectedData([]);
      return;
    }

    // Formatear los datos para la tabla
    const formattedData = filtered.map((item) => ({
      idtra: item.title || "Sin IDTRA", // ID único
      nombreCliente: item._customerid_value || "Desconocido",
      pol: getPolName(item.new_pol) || "Desconocido", // Obtén el nombre del POL
      etd: item.new_eta ? moment(item.new_eta).format("YYYY-MM-DD") : "N/A", // Formatea la fecha
      status: getStatusName(item.new_preestado2) || "Desconocido", // Obtén el nombre del estado
      po: item.new_po || "Sin PO", // PO
    }));

    setSelectedData(formattedData);

    // Abrir el modal con los datos filtrados
    setModalData(formattedData);
    setModalTitle(
      `Detalles para ${type === "executive" ? "Ejecutivo" : "Cliente"}: ${
        data.label
      }`
    );
    setIsModalOpen(true);
  };

  // Cerrar modal si se hace clic fuera de él
  const handleModalClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Estadísticas */}
      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {[
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
        ].map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <DoughnutChart
          title="Cargas por Ejecutivo"
          data={Object.keys(chartData.executive).map((key) => ({
            label: getEjecutivoName(key),
            value: chartData.executive[key],
            id: key, // ID necesario para el filtro
          }))}
          onSliceClick={(data) => handleCircleClick("executive", data)} // Enlazar con el evento clic
        />

        <DoughnutChart
          title="Cargas por Cliente"
          data={Object.keys(chartData.client).map((key) => ({
            label: key,
            value: chartData.client[key],
            id: key, // ID necesario para el filtro
          }))}
          onSliceClick={(data) => handleCircleClick("client", data)} // Enlazar con el evento clic
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          title={modalTitle}
          onClose={() => setIsModalOpen(false)} // Cerrar modal
        >
          <DataTable
            data={selectedData} // Datos formateados
            columns={[
              { label: "#IDTRA", key: "idtra" },
              { label: "Nombre Cliente", key: "nombreCliente" },
              { label: "POL", key: "pol" },
              { label: "ETD", key: "etd" },
              { label: "STATUS", key: "status" },
              { label: "#PO", key: "po" },
            ]}
          />
        </Modal>
      )}
    </>
  );
}

export default Dashboard;

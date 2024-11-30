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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  const [categoryStats, setCategoryStats] = useState({
    origen: 0,
    ptoEntrada: 0,
    movimientoWHS: 0,
    enWHS: 0,
    enTransito: {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
    },
  });

  const handleCategoryClick = (category, period = null) => {
    let filtered = [];
    let title = "";

    switch (category) {
      case "origen":
        filtered = filteredData.filter((item) =>
          preestadoCategories.origen.includes(item.new_preestado2)
        );
        title = "Cargas en Origen";
        break;
      case "ptoEntrada":
        filtered = filteredData.filter((item) =>
          preestadoCategories.ptoEntrada.includes(item.new_preestado2)
        );
        title = "Cargas en Pto Entrada";
        break;
      case "movimientoWHS":
        filtered = filteredData.filter((item) =>
          preestadoCategories.movimientoWHS.includes(item.new_preestado2)
        );
        title = "Movimiento a WHS / HUB de Carga";
        break;
      case "enWHS":
        filtered = filteredData.filter((item) =>
          preestadoCategories.enWHS.includes(item.new_preestado2)
        );
        title = "Cargas en WHS / HUB de Carga";
        break;
      case "enTransito":
        const today = moment().startOf("day");
        const endOfToday = moment().endOf("day");
        const startOfWeek = moment().startOf("week");
        const endOfWeek = moment().endOf("week");
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");

        filtered = filteredData.filter((item) =>
          preestadoCategories.enTransito.includes(item.new_preestado2)
        );

        if (period === "today") {
          filtered = filtered.filter((item) =>
            moment(item.new_eta).isBetween(today, endOfToday, null, "[]")
          );
          title = "Cargas en Tránsito (Hoy)";
        } else if (period === "week") {
          filtered = filtered.filter((item) =>
            moment(item.new_eta).isBetween(startOfWeek, endOfWeek, null, "[]")
          );
          title = "Cargas en Tránsito (Semana)";
        } else if (period === "month") {
          filtered = filtered.filter((item) =>
            moment(item.new_eta).isBetween(startOfMonth, endOfMonth, null, "[]")
          );
          title = "Cargas en Tránsito (Mes)";
        } else {
          title = "Cargas en Tránsito (Total)";
        }
        break;
      default:
        return;
    }

    // Formatear los datos para la tabla
    const formattedData = filtered.map((item) => ({
      idtra: item.title || "Sin IDTRA", // ID único
      nombreCliente: item._customerid_value || "Desconocido",
      pol: getPolName(item.new_pol) || "Desconocido",
      etd: item.new_eta ? moment(item.new_eta).format("YYYY-MM-DD") : "N/A",
      status: getStatusName(item.new_preestado2) || "Desconocido",
      po: item.new_po || "Sin PO",
    }));

    setModalData(formattedData);
    setModalTitle(title);
    setIsModalOpen(true);

    console.log("Datos filtrados:", filtered);
    console.log("Datos formateados:", formattedData);
  };

  const preestadoCategories = {
    origen: [100000000, 100000001, 100000015, 100000014, 100000017],
    enTransito: [100000002],
    ptoEntrada: [100000027, 100000003],
    movimientoWHS: [100000007, 100000024],
    enWHS: [
      100000010, 100000022, 100000023, 100000025, 100000004, 100000026,
      100000020, 100000019, 100000016, 100000008, 100000011, 100000006,
      100000013, 100000028, 100000009, 100000005,
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.logisticacastrofallas.com/api/TransInternacional?numFilter=0"
        );
        const data = response.data.data.value;

        // Filtrar datos válidos
        const validData = data.filter((item) => moment(item.new_eta));

        setFilteredData(validData);

        const today = moment().startOf("day");
        const endOfToday = moment().endOf("day");
        const startOfWeek = moment().startOf("week");
        const endOfWeek = moment().endOf("week");
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");

        // Estadísticas por categoría
        const categoryStats = {
          origen: validData.filter((item) =>
            preestadoCategories.origen.includes(item.new_preestado2)
          ).length,
          ptoEntrada: validData.filter((item) =>
            preestadoCategories.ptoEntrada.includes(item.new_preestado2)
          ).length,
          movimientoWHS: validData.filter((item) =>
            preestadoCategories.movimientoWHS.includes(item.new_preestado2)
          ).length,
          enWHS: validData.filter((item) =>
            preestadoCategories.enWHS.includes(item.new_preestado2)
          ).length,
          enTransito: {
            today: validData.filter(
              (item) =>
                preestadoCategories.enTransito.includes(item.new_preestado2) &&
                moment(item.new_eta).isBetween(today, endOfToday, null, "[]")
            ).length,
            week: validData.filter(
              (item) =>
                preestadoCategories.enTransito.includes(item.new_preestado2) &&
                moment(item.new_eta).isBetween(
                  startOfWeek,
                  endOfWeek,
                  null,
                  "[]"
                )
            ).length,
            month: validData.filter(
              (item) =>
                preestadoCategories.enTransito.includes(item.new_preestado2) &&
                moment(item.new_eta).isBetween(
                  startOfMonth,
                  endOfMonth,
                  null,
                  "[]"
                )
            ).length,
            total: validData.filter((item) =>
              preestadoCategories.enTransito.includes(item.new_preestado2)
            ).length,
          },
        };

        setCategoryStats(categoryStats);

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
      setModalData([]);
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

    setModalData(formattedData);

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
      {/* Estadísticas de Cargas en Tránsito */}
      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {[
          {
            title: "Cargas en Tránsito (Hoy)",
            value: categoryStats.enTransito.today || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-red-500" />,
            onClick: () => handleCategoryClick("enTransito", "today"),
          },
          {
            title: "Cargas en Tránsito (Semana)",
            value: categoryStats.enTransito.week || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-red-500" />,
            onClick: () => handleCategoryClick("enTransito", "week"),
          },
          {
            title: "Cargas en Tránsito (Mes)",
            value: categoryStats.enTransito.month || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-red-500" />,
            onClick: () => handleCategoryClick("enTransito", "month"),
          },
          {
            title: "Cargas en Tránsito (Total)",
            value: categoryStats.enTransito.total || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-red-500" />,
            onClick: () => handleCategoryClick("enTransito"),
          },
        ].map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
      </div>

      {/* Estadísticas Totales para las demás categorías */}
      <div className="grid lg:grid-cols-4 mt-4 md:grid-cols-2 grid-cols-1 gap-6">
        {[
          {
            title: "Cargas en Origen",
            value: categoryStats.origen || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-blue-500" />,
            onClick: () => handleCategoryClick("origen"),
          },
          {
            title: "Cargas en Pto Entrada",
            value: categoryStats.ptoEntrada || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-purple-500" />,
            onClick: () => handleCategoryClick("ptoEntrada"),
          },
          {
            title: "Movimiento a WHS / HUB de Carga",
            value: categoryStats.movimientoWHS || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-teal-500" />,
            onClick: () => handleCategoryClick("movimientoWHS"),
          },
          {
            title: "Cargas en WHS/HUB de Carga",
            value: categoryStats.enWHS || 0,
            icon: <CircleStackIcon className="w-8 h-8 text-orange-500" />,
            onClick: () => handleCategoryClick("enWHS"),
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
            data={modalData} // Datos formateados
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

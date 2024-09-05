import { useEffect, useState } from "react";
import moment from "moment";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { useDispatch } from 'react-redux'; // Asegúrate de importar useDispatch

// Importación de los archivos JSON desde el directorio src
import polMapping from '../../data/pol.json';
import poeMapping from '../../data/poe.json';
import statusMapping from '../../data/status.json';
import cantEquipoMapping from '../../data/cantEquipo.json';
import tamanoEquipoMapping from '../../data/tamanoEquipo.json';
import ejecutivoMapping from '../../data/ejecutivo.json';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("0");
  const [textFilter, setTextFilter] = useState("");
  const dispatch = useDispatch();

  // Función para obtener los leads
  const fetchLeads = async (filterValue, textValue) => {
    try {
      const response = await fetch(
        `http://localhost:5218/api/TransInternacional?numFilter=${filterValue}&textFilter=${textValue}`
      );
      const data = await response.json();
      if (data.isSuccess) {
        const leadsData = data.data.value;
        const today = moment().startOf("day");

        if (filter === "0") {
          const filteredData = leadsData
            .filter(
              (item) =>
                item.new_eta && moment(item.new_eta).isSameOrAfter(today)
            )
            .sort((a, b) => moment(a.new_eta) - moment(b.new_eta));

          setLeads(filteredData);
        } else {
          setLeads(leadsData);
        }
      } else {
        dispatch(
          showNotification({ message: data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({ message: "Error fetching leads", type: "error" })
      );
    }
  };

  useEffect(() => {
    fetchLeads(filter, textFilter);
  }, [filter, textFilter, dispatch]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleTextFilterChange = (e) => {
    setTextFilter(e.target.value);
  };

  const renderBooleanBadge = (value) => (
    <div className={`badge ${value ? "badge-success" : "badge-error"}`}>
      {value ? "Sí" : "No"}
    </div>
  );

  const getPolName = (pol) => polMapping[pol] || "";
  const getPoeName = (poe) => poeMapping[poe] || "";
  const getStatusName = (status) => statusMapping[status] || "";
  const getCantEquipoName = (cantEquipo) => cantEquipoMapping[cantEquipo] || "";
  const getTamanoEquipoName = (tamanoEquipo) => tamanoEquipoMapping[tamanoEquipo] || "";
  const getEjecutivoName = (ejecutivo) => ejecutivoMapping[ejecutivo] || "";

  return (
    <>
      <TitleCard title="Transporte Internacional" topMargin="mt-2">
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <select
              className="select select-primary"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="0">Todos</option>
              <option value="1">Cliente</option>
              <option value="2">Contenedor</option>
              <option value="3">BCF</option>
              <option value="4">Factura</option>
              <option value="5">PO</option>
            </select>
            <input
              type="text"
              className="input input-primary"
              value={textFilter}
              onChange={handleTextFilterChange}
              placeholder="Buscar..."
            />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>IDTRA</th>
                <th>Status</th>
                <th>Cliente</th>
                <th>Ejecutivo</th>
                <th>Contenedor</th>
                <th>Factura</th>
                <th>Commodity</th>
                <th>BCF</th>
                <th>PO</th>
                <th>POL</th>
                <th>POE</th>
                <th>Fecha ETA</th>
                <th>Confirmación de Zarpe</th>
                <th>Cantidad de Equipo</th>
                <th>Tamaño de Equipo</th>
                <th>Cantidad de Bultos</th>
                <th>Peso</th>
                <th>Certificado Origen</th>
                <th>Certificado Reexportación</th>
                <th>Exoneración</th>
                <th>Entrega BL Original</th>
                <th>Entrega Carga de Trazabilidad</th>
                <th>Fecha BL Impreso</th>
                <th>Fecha BL Digitado TICA</th>
                <th>Entrega de Traducción</th>
                <th>Liberación Documental</th>
                <th>Liberación Financiera</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, k) => (
                <tr key={k}>
                  <td>{l.title}</td>
                  <td>{getStatusName(l.new_preestado2)}</td>
                  <td>{l._customerid_value}</td>
                  <td>{getEjecutivoName(l.new_ejecutivocomercial)}</td>
                  <td>{l.new_contenedor}</td>
                  <td>{l.new_factura}</td>
                  <td>{l.new_commodity}</td>
                  <td>{l.new_bcf}</td>
                  <td>{l.new_po}</td>
                  <td>{getPolName(l.new_pol)}</td>
                  <td>{getPoeName(l.new_poe)}</td>
                  <td>
                    {l.new_eta ? moment(l.new_eta).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_confirmacionzarpe ? moment(l.new_confirmacionzarpe).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>{getCantEquipoName(l.new_cantequipo)}</td>
                  <td>{getTamanoEquipoName(l.new_tamaoequipo)}</td>
                  <td>{l.new_contidadbultos}</td>
                  <td>{l.new_peso}</td>
                  <td>{renderBooleanBadge(l.new_aplicacertificadodeorigen)}</td>
                  <td>{renderBooleanBadge(l.new_aplicacertificadoreexportacion)}</td>
                  <td>{renderBooleanBadge(l.new_llevaexoneracion)}</td>
                  <td>{l.new_entregabloriginal ? moment(l.new_entregabloriginal).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_entregacartadestrazabilidad ? moment(l.new_entregacartadestrazabilidad).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_blimpreso ? moment(l.new_blimpreso).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_bldigitadotica ? moment(l.new_bldigitadotica).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_entregatraduccion ? moment(l.new_entregatraduccion).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_liberaciondocumental ? moment(l.new_liberaciondocumental).format("DD MMM YY") : "N/A"}</td>
                  <td>{l.new_liberacionfinanciera ? moment(l.new_liberacionfinanciera).format("DD MMM YY") : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </>
  );
}

export default Leads;

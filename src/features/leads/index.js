import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("0"); // Default filter value
  const [textFilter, setTextFilter] = useState("");
  const dispatch = useDispatch();

  const fetchLeads = async (filterValue, textValue) => {
    try {
      const response = await axios.get(
        `http://localhost:5218/api/TransInternacional?numFilter=${filterValue}&textFilter=${textValue}`
      );
      if (response.data.isSuccess) {
        const data = response.data.data.value;
        const today = moment().startOf("day");

        if (filter == "0") {
          const filteredData = data
            .filter(
              (item) =>
                item.new_eta && moment(item.new_eta).isSameOrAfter(today)
            )
            .sort((a, b) => moment(a.new_eta) - moment(b.new_eta));

          setLeads(filteredData);
        } else {
          setLeads(data);
        }
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
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
              <option value="0"></option>
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
        {/* Leads List in table format loaded from slice after api call */}
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
                  <td>{l.new_preestado2}</td>
                  <td>{l._customerid_value}</td>
                  <td>{l.new_ejecutivocomercial}</td>
                  <td>{l.new_contenedor}</td>
                  <td>{l.new_factura}</td>
                  <td>{l.new_commodity}</td>
                  <td>{l.new_bcf}</td>
                  <td>{l.new_pol}</td>
                  <td>{l.new_poe}</td>
                  <td>{l.new_po}</td>
                  <td>
                    {l.new_eta ? moment(l.new_eta).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_confirmacionzarpe ? moment(l.new_confirmacionzarpe).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>{l.new_cantequipo}</td>
                  <td>{l.new_tamaoequipo}</td>
                  <td>{l.new_contidadbultos}</td>
                  <td>{l.new_peso}</td>
                  <td>{renderBooleanBadge(l.new_aplicacertificadodeorigen)}</td>
                  <td>
                    {renderBooleanBadge(l.new_aplicacertificadoreexportacion)}
                  </td>
                  <td>{renderBooleanBadge(l.new_llevaexoneracion)}</td>
                  <td>
                    {l.new_entregabloriginal ? moment(l.new_entregabloriginal).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_entregacartatrazabilidad ? moment(l.new_entregacartatrazabilidad).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_fechablimpreso ? moment(l.new_fechablimpreso).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_fechabldigittica ? moment(l.new_fechabldigittica).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_entregatraduccion ? moment(l.new_entregatraduccion).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_liberacionmovimientoinventario ? moment(l.new_liberacionmovimientoinventario).format("DD MMM YY") : "N/A"}
                  </td>
                  <td>
                    {l.new_fechaliberacionfinanciera ? moment(l.new_fechaliberacionfinanciera).format("DD MMM YY") : "N/A"}
                  </td>
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

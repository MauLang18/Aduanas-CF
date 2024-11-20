import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { useDispatch } from "react-redux";

// Importación de los archivos JSON
import polMapping from "../../data/pol.json";
import poeMapping from "../../data/poe.json";
import statusMapping from "../../data/status.json";
import cantEquipoMapping from "../../data/cantEquipo.json";
import tamanoEquipoMapping from "../../data/tamanoEquipo.json";
import ejecutivoMapping from "../../data/ejecutivo.json";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("0");
  const [textFilter, setTextFilter] = useState("");
  const [comments, setComments] = useState({}); // Estado para almacenar los comentarios
  const dispatch = useDispatch();

  // Función para obtener los leads
  const fetchLeads = async (filterValue, textValue) => {
    try {
      const response = await fetch(
        `https://api.logisticacastrofallas.com/api/TransInternacional?numFilter=${filterValue}&textFilter=${textValue}`
      );
      const data = await response.json();
      if (data.isSuccess) {
        const leadsData = data.data.value;
        const today = moment().startOf("day");

        // Filtrar para excluir los preestados indeseados
        let filteredData = leadsData;

        filteredData = filteredData.sort((a, b) => {
          const now = moment();

          // Si 'a' no tiene ETA, va al fondo
          if (!a.new_eta && b.new_eta) return 1;
          if (!b.new_eta && a.new_eta) return -1;
          if (!a.new_eta && !b.new_eta) return 0;

          // Verificar si las fechas son anteriores al presente
          const isAPast = moment(a.new_eta).isBefore(now);
          const isBPast = moment(b.new_eta).isBefore(now);

          // Si 'a' es pasado y 'b' no, 'b' va primero
          if (isAPast && !isBPast) return 1;
          if (!isAPast && isBPast) return -1;

          // Ordenar las fechas posteriores (o ambas pasadas) por cercanía al presente
          const diffA = Math.abs(moment(a.new_eta).diff(now));
          const diffB = Math.abs(moment(b.new_eta).diff(now));

          return diffA - diffB; // Fecha más cercana primero
        });

        // Crear un objeto de comentarios inicial a partir de los datos filtrados
        const initialComments = filteredData.reduce((acc, lead) => {
          acc[lead.incidentid] = lead.new_observacionesgenerales || "";
          return acc;
        }, {});

        setComments(initialComments); // Establecer los comentarios iniciales
        setLeads(filteredData); // Establecer los leads filtrados
      } else {
        dispatch(showNotification({ message: data.message, type: "error" }));
      }
    } catch (error) {
      dispatch(
        showNotification({ message: "Error fetching leads", type: "error" })
      );
    }
  };

  useEffect(() => {
    fetchLeads(filter, textFilter);
  }, [filter, textFilter]);

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
  const getTamanoEquipoName = (tamanoEquipo) =>
    tamanoEquipoMapping[tamanoEquipo] || "";
  const getEjecutivoName = (ejecutivo) => ejecutivoMapping[ejecutivo] || "";

  // Manejar el cambio de comentario en el campo de texto
  const handleCommentChange = (e, id) => {
    setComments({ ...comments, [id]: e.target.value });
  };

  // Guardar el comentario cuando el usuario salga del campo de texto (onBlur)
  const handleCommentBlur = async (id) => {
    const comentario = comments[id] || "";
    try {
      const response = await axios.patch(
        "https://api.logisticacastrofallas.com/api/TransInternacional/Agregar",
        {
          transInternacionalId: id,
          comentario,
        }
      );

      if (response.data.isSuccess) {
        dispatch(
          showNotification({ message: "Comentario guardado", type: "success" })
        );
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al guardar el comentario",
          type: "error",
        })
      );
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        "https://api.logisticacastrofallas.com/api/TransInternacional/Download?numFilter=0",
        {
          responseType: "blob", // Asegurarse de que se reciba el archivo como un Blob
        }
      );

      // Crear una URL para el archivo Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crear un enlace temporal para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transporte_internacional.xlsx"); // Nombre del archivo

      // Añadir el enlace al documento y hacer clic en él para iniciar la descarga
      document.body.appendChild(link);
      link.click();

      // Remover el enlace temporal del DOM
      document.body.removeChild(link);
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al descargar el archivo",
          type: "error",
        })
      );
    }
  };

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
              <option value="6">IDTRA</option>
            </select>
            <input
              type="text"
              className="input input-primary"
              value={textFilter}
              onChange={handleTextFilterChange}
              placeholder="Buscar..."
            />
            <button
              className="btn btn-primary ml-4"
              onClick={handleDownloadExcel}
            >
              Descargar Excel
            </button>
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
                <th>Comentario</th>
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
                    {l.new_confirmacionzarpe
                      ? moment(l.new_confirmacionzarpe).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>{getCantEquipoName(l.new_cantequipo)}</td>
                  <td>{getTamanoEquipoName(l.new_tamaoequipo)}</td>
                  <td>{l.new_contidadbultos}</td>
                  <td>{l.new_peso}</td>
                  <td>{renderBooleanBadge(l.new_aplicacertificadodeorigen)}</td>
                  <td>
                    {renderBooleanBadge(l.new_aplicacertificadoreexportacion)}
                  </td>
                  <td>{renderBooleanBadge(l.new_llevaexoneracion)}</td>
                  <td>{renderBooleanBadge(l.new_entregabloriginal)}</td>
                  <td>{renderBooleanBadge(l.new_entregacartatrazabilidad)}</td>
                  <td>
                    {l.new_fechablimpreso
                      ? moment(l.new_fechablimpreso).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {l.new_fechabldigittica
                      ? moment(l.new_fechabldigittica).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {l.new_entregatraduccion
                      ? moment(l.new_entregatraduccion).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {l.new_liberacionmovimientoinventario
                      ? moment(l.new_liberacionmovimientoinventario).format(
                          "DD MMM YY"
                        )
                      : "N/A"}
                  </td>
                  <td>
                    {l.new_fechaliberacionfinanciera
                      ? moment(l.new_fechaliberacionfinanciera).format(
                          "DD MMM YY"
                        )
                      : "N/A"}
                  </td>
                  <td>
                    <textarea
                      value={comments[l.incidentid] || ""}
                      onChange={(e) => handleCommentChange(e, l.incidentid)}
                      onBlur={() => handleCommentBlur(l.incidentid)}
                      placeholder="Agrega un comentario"
                      className="textarea textarea-primary"
                    ></textarea>
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

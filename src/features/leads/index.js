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
  const [comments, setComments] = useState({});
  const [documents, setDocuments] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();

  const documentFields = [
    "new_facturacomercial",
    "new_listadeempaque",
    "new_draftbl",
    "new_bloriginal",
    "new_cartatrazabilidad",
    "new_cartadesglosecargos",
    "new_exoneracion",
    "new_certificadoorigen",
    "new_certificadoreexportacion",
    "new_permisos",
  ];

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

  const handleFileUpload = async (file, leadId, fieldName) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("transInternacionalId", leadId);
    formData.append("fieldName", fieldName);

    try {
      const response = await axios.post(
        "https://api.logisticacastrofallas.com/api/TransInternacional/Upload",
        formData
      );

      if (response.data.isSuccess) {
        dispatch(
          showNotification({
            message: "Documento subido con éxito",
            type: "success",
          })
        );

        setDocuments((prev) => ({
          ...prev,
          [leadId]: {
            ...prev[leadId],
            [fieldName]: response.data.fileUrl,
          },
        }));
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al subir el documento",
          type: "error",
        })
      );
    }
  };

  const handleDocumentClick = (url) => {
    setSelectedDocument(url);
    setModalOpen(true);
  };

  const renderBooleanBadge = (value) => (
    <div className={`badge ${value ? "badge-success" : "badge-error"}`}>
      {value ? "Sí" : "No"}
    </div>
  );

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleTextFilterChange = (e) => {
    setTextFilter(e.target.value);
  };

  const handleCommentChange = (e, id) => {
    setComments({ ...comments, [id]: e.target.value });
  };

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

  const getPolName = (pol) => polMapping[pol] || "";
  const getPoeName = (poe) => poeMapping[poe] || "";
  const getStatusName = (status) => statusMapping[status] || "";
  const getCantEquipoName = (cantEquipo) => cantEquipoMapping[cantEquipo] || "";
  const getTamanoEquipoName = (tamanoEquipo) =>
    tamanoEquipoMapping[tamanoEquipo] || "";
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
                {/* Columnas existentes */}
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
                {/* Nuevas columnas */}
                {/* <th>Factura Comercial</th>
                <th>Lista de Empaque</th>
                <th>Draft BL</th>
                <th>BL Original</th>
                <th>Carta Trazabilidad</th>
                <th>Carta Desglose Cargos</th>
                <th>Exoneración</th>
                <th>Certificado Origen</th>
                <th>Certificado Re-Exportación</th>
                <th>Permisos</th> */}
                {documentFields.map((field) => (
                  <th key={field}>{field.replace("new_", "").toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.incidentid}>
                  {/* Datos existentes */}
                  <td>{lead.title}</td>
                  <td>{getStatusName(lead.new_preestado2)}</td>
                  <td>{lead._customerid_value}</td>
                  <td>{getEjecutivoName(lead.new_ejecutivocomercial)}</td>
                  <td>{lead.new_contenedor}</td>
                  <td>{lead.new_factura}</td>
                  <td>{lead.new_commodity}</td>
                  <td>{lead.new_bcf}</td>
                  <td>{lead.new_po}</td>
                  <td>{getPolName(lead.new_pol)}</td>
                  <td>{getPoeName(lead.new_poe)}</td>
                  <td>
                    {lead.new_eta
                      ? moment(lead.new_eta).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {lead.new_confirmacionzarpe
                      ? moment(lead.new_confirmacionzarpe).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>{getCantEquipoName(lead.new_cantequipo)}</td>
                  <td>{getTamanoEquipoName(lead.new_tamaoequipo)}</td>
                  <td>{lead.new_contidadbultos}</td>
                  <td>{lead.new_peso}</td>
                  <td>
                    {renderBooleanBadge(lead.new_aplicacertificadodeorigen)}
                  </td>
                  <td>
                    {renderBooleanBadge(
                      lead.new_aplicacertificadoreexportacion
                    )}
                  </td>
                  <td>{renderBooleanBadge(lead.new_llevaexoneracion)}</td>
                  <td>{renderBooleanBadge(lead.new_entregabloriginal)}</td>
                  <td>
                    {renderBooleanBadge(lead.new_entregacartatrazabilidad)}
                  </td>
                  <td>
                    {lead.new_fechablimpreso
                      ? moment(lead.new_fechablimpreso).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {lead.new_fechabldigittica
                      ? moment(lead.new_fechabldigittica).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {lead.new_entregatraduccion
                      ? moment(lead.new_entregatraduccion).format("DD MMM YY")
                      : "N/A"}
                  </td>
                  <td>
                    {lead.new_liberacionmovimientoinventario
                      ? moment(lead.new_liberacionmovimientoinventario).format(
                          "DD MMM YY"
                        )
                      : "N/A"}
                  </td>
                  <td>
                    {lead.new_fechaliberacionfinanciera
                      ? moment(lead.new_fechaliberacionfinanciera).format(
                          "DD MMM YY"
                        )
                      : "N/A"}
                  </td>
                  <td>
                    <textarea
                      value={comments[lead.incidentid] || ""}
                      onChange={(e) => handleCommentChange(e, lead.incidentid)}
                      onBlur={() => handleCommentBlur(lead.incidentid)}
                      placeholder="Agrega un comentario"
                      className="textarea textarea-primary"
                    ></textarea>
                  </td>
                  {/* Nuevas columnas */}
                  {/* {Object.keys(documents[lead.incidentid] || {}).map(
                    (field) => (
                      <td key={field}>
                        {documents[lead.incidentid][field] ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() =>
                              handleDocumentClick(
                                documents[lead.incidentid][field]
                              )
                            }
                          >
                            Ver
                          </button>
                        ) : (
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files[0],
                                lead.incidentid,
                                field
                              )
                            }
                          />
                        )}
                      </td>
                    )
                  )} */}
                  {documentFields.map((field) => (
                    <td key={field}>
                      {documents[lead.incidentid]?.[field] ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleDocumentClick(
                              documents[lead.incidentid][field]
                            )
                          }
                        >
                          Ver
                        </button>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileUpload(
                              e.target.files[0],
                              lead.incidentid,
                              field
                            )
                          }
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      {/* Modal para ver documentos */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box z-50">
            <iframe
              src={selectedDocument}
              title="Documento PDF"
              className="w-full h-96"
            ></iframe>
            <div className="modal-action">
              <button className="btn" onClick={() => setModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Leads;

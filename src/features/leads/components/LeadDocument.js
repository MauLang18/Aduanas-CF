import { jsPDF } from "jspdf";
import "jspdf-autotable";
import polMapping from "../../../data/pol.json";
import poeMapping from "../../../data/poe.json";
import statusMapping from "../../../data/status.json";
import cantEquipoMapping from "../../../data/cantEquipo.json";
import tamanoEquipoMapping from "../../../data/tamanoEquipo.json";
import ejecutivoMapping from "../../../data/ejecutivo.json";
import aforoMapping from "../../../data/aforo.json";
import moment from "moment";

const LeadDocument = ({ lead }) => {
  if (!lead) return null;

  const getPolName = (pol) => polMapping[pol] || "N/A";
  const getPoeName = (poe) => poeMapping[poe] || "N/A";
  const getStatusName = (status) => statusMapping[status] || "N/A";
  const getCantEquipoName = (cantEquipo) =>
    cantEquipoMapping[cantEquipo] || "N/A";
  const getTamanoEquipoName = (tamanoEquipo) =>
    tamanoEquipoMapping[tamanoEquipo] || "N/A";
  const getEjecutivoName = (ejecutivo) => ejecutivoMapping[ejecutivo] || "N/A";
  const getAforoName = (aforo) => aforoMapping[aforo] || "N/A";

  const formatDate = (date) =>
    moment(date).isValid() ? moment(date).format("DD MMM YY") : "N/A";

  const downloadPDF = async () => {
    try {
      const response = await fetch(
        `https://api.logisticacastrofallas.com/api/TransInternacional/Pdf?textFilter=${lead.title}`
      );

      if (!response.ok) {
        throw new Error("Error al descargar el PDF.");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${lead.title}.pdf`;
      link.click();

      alert("El PDF se descargó correctamente.");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
    }
  };

  return (
    <div className="p-4">
      <div className="p-4 bg-white shadow-lg rounded-md">
        <h1 className="text-center text-2xl font-bold text-blue-600 mb-4">
          SISTEMA SINCRONIZADO DE ADUANAS
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <p>
            <strong>Cliente:</strong> {lead._customerid_value || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {getStatusName(lead.new_preestado2) || "PENDIENTE"}
          </p>
          <p>
            <strong>Ejecutivo Asignado:</strong>{" "}
            {getEjecutivoName(lead.new_ejecutivocomercial) || "PENDIENTE"}
          </p>
        </div>

        <h2 className="text-lg font-semibold mb-2">IDTRA #{lead.title}</h2>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">Detalles de la Carga</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Factura Comercial:</strong>{" "}
              {lead.new_factura || "PENDIENTE"}
            </li>
            <li>
              <strong>Commodity:</strong> {lead.new_commodity || "PENDIENTE"}
            </li>
            <li>
              <strong>Cantidad de Bultos:</strong>{" "}
              {lead.new_contidadbultos || "PENDIENTE"}
            </li>
            <li>
              <strong>Peso:</strong> {lead.new_peso || "PENDIENTE"}
            </li>
            <li>
              <strong>PO:</strong> {lead.new_po || "PENDIENTE"}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">Detalles de Transporte</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>BL #:</strong> {lead.new_bcf || "PENDIENTE"}
            </li>
            <li>
              <strong>Contenedor:</strong> {lead.new_contenedor || "PENDIENTE"}
            </li>
            <li>
              <strong>Confirmación Zarpe:</strong>{" "}
              {moment(lead.new_confirmacinzarpe).format("DD MMM YY") ||
                "PENDIENTE"}
            </li>
            <li>
              <strong>POL:</strong> {getPolName(lead.new_pol) || "PENDIENTE"}
            </li>
            <li>
              <strong>POE:</strong> {getPoeName(lead.new_poe) || "PENDIENTE"}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">
            Confirmación Liberación
          </h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Liberación Documental:</strong>{" "}
              {moment(lead.new_liberacionmovimientoinventario).format(
                "DD MMM YY"
              ) || "PENDIENTE"}
            </li>
            <li>
              <strong>Liberación Financiera:</strong>{" "}
              {moment(lead.new_fechaliberacionfinanciera).format("DD MMM YY") ||
                "PENDIENTE"}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">Status Aduanas</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Tipo Aforo:</strong>{" "}
              {getAforoName(lead.new_tipoaforo) || "PENDIENTE"}
            </li>
            <li>
              <strong># DUA Anticipado:</strong>{" "}
              {lead.new_duaanticipados || "PENDIENTE"}
            </li>
            <li>
              <strong># DUA Nacional:</strong>{" "}
              {lead.new_duanacional || "PENDIENTE"}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">Documentación</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Borrador de Impuestos:</strong>{" "}
              {lead.new_borradordeimpuestos ? (
                <a
                  href={lead.new_borradordeimpuestos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Documentación Nacional:</strong>{" "}
              {lead.new_documentodenacionalizacion ? (
                <a
                  href={lead.new_documentodenacionalizacion}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
          </ul>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">
            Documentación de la carga
          </h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Factura Comercial:</strong>{" "}
              {lead.new_facturacomercial ? (
                <a
                  href={lead.new_facturacomercial}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Lista de Empaque:</strong>{" "}
              {lead.new_listadeempaque ? (
                <a
                  href={lead.new_listadeempaque}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Fecha Entrega Traducción:</strong>{" "}
              {moment(lead.new_entregatraduccion).format("DD MMM YY") ||
                "PENDIENTE"}
            </li>
            <li>
              <strong>Traducción de Factura:</strong>{" "}
              {lead.new_traducciondefacturas ? (
                <a
                  href={lead.new_traducciondefacturas}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Permisos:</strong>{" "}
              {lead.new_permisos ? (
                <a
                  href={lead.new_permisos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Exoneración:</strong>{" "}
              {lead.new_llevaexoneracion ? "Sí" : "No"}
            </li>
            <li>
              <strong>Exoneración (Documento):</strong>{" "}
              {lead.new_exoneracion ? (
                <a
                  href={lead.new_exoneracion}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">
            Documentación Conocimiento Embarque
          </h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Draft BL:</strong>{" "}
              {lead.new_draftbl ? (
                <a
                  href={lead.new_draftbl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Fecha BL Digitado Tica:</strong>{" "}
              {moment(lead.new_fechabldigittica).format("DD MMM YY") ||
                "PENDIENTE"}
            </li>
            <li>
              <strong>Entrega BL Original:</strong>{" "}
              {moment(lead.new_entregabloriginal).format("DD MMM YY") || "No"}
            </li>
            <li>
              <strong>Fecha BL Impreso:</strong>{" "}
              {moment(lead.new_fechablimpreso).format("DD MMM YY") ||
                "PENDIENTE"}
            </li>
            <li>
              <strong>BL Original:</strong>{" "}
              {lead.new_bloriginal ? (
                <a
                  href={lead.new_bloriginal}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Entrega Carta Trazabilidad:</strong>{" "}
              {moment(lead.new_entregacartatrazabilidad).format("DD MMM YY") ||
                "No"}
            </li>
            <li>
              <strong>Carta Trazabilidad:</strong>{" "}
              {lead.new_cartatrazabilidad ? (
                <a
                  href={lead.new_cartatrazabilidad}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Desglose de Cargos:</strong>{" "}
              {lead.new_cartadesglosecargos ? (
                <a
                  href={lead.new_cartadesglosecargos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2">
            Preferencia Arancelaria
          </h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Certificado Origen:</strong>{" "}
              {lead.new_aplicacertificadodeorigen ? "Sí" : "No"}
            </li>
            <li>
              <strong>Cert. Re-exportación:</strong>{" "}
              {lead.new_aplicacertificadoreexportacion ? "Sí" : "No"}
            </li>
            <li>
              <strong>Borrador C.O.:</strong>{" "}
              {lead.new_borradordecertificadodeorigen ? (
                <a
                  href={lead.new_borradordecertificadodeorigen}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Certificado Origen (Documento):</strong>{" "}
              {lead.new_certificadoorigen ? (
                <a
                  href={lead.new_certificadoorigen}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
            <li>
              <strong>Certificado Re-exportación:</strong>{" "}
              {lead.new_certificadoreexportacion ? (
                <a
                  href={lead.new_certificadoreexportacion}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              ) : (
                "PENDIENTE"
              )}
            </li>
          </ul>
        </div>

        <button onClick={downloadPDF} className="mt-4 btn btn-primary">
          Descargar PDF
        </button>
      </div>
    </div>
  );
};

export default LeadDocument;

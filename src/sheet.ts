import { google } from 'googleapis';
import * as fs from 'fs';

// Tipo para la respuesta de valores de una hoja
interface SheetDataResponse {
  [key: string]: {
    value: string,
    cell: string
  }[]
}

const spreadsheetId = "EL ID DE TU HOJA DE EXCEL"
const range = "EL NOMBRE DE TU HOJA DE EXCEL"

// Cargar las credenciales de la Service Account
const credentials = JSON.parse(fs.readFileSync('creds.json', 'utf8'));

// Configurar el cliente JWT para la autenticación con la cuenta de servicio
const auth = new google.auth.JWT(
  credentials.client_email,
  undefined,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function authenticate() {

  await auth.authorize();
}

// Función para obtener los datos de una hoja de cálculo
export async function getSpreadsheetData(): Promise<SheetDataResponse | null> {
  await authenticate();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range,
  });

  // response.data as any || null;

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return null;  // Retorna null si no hay datos
  }

  // La primera fila será usada como claves (headers)
  const headers = rows[0];

  // Inicializamos un objeto donde cada clave será un array de objetos con value y cell
  const dataAsObject = {};
  headers.forEach((header, colIndex) => {
    header = header.toLocaleLowerCase();
    dataAsObject[header] = [];
  });
  
  // Rellenamos los arrays con objetos que contienen el valor y la referencia de la celda (ej. "A1")
  rows.slice(1).forEach((row, rowIndex) => {
    headers.forEach((header: string, colIndex) => {
      header = header.toLocaleLowerCase();
      const cellValue = row[colIndex] || '';  // Valor de la celda o vacío si no hay valor
      const cellReference = `${String.fromCharCode(65 + colIndex)}${rowIndex + 2}`;  // Convertir columna a letra y fila
      dataAsObject[header].push({
        value: cellValue,
        cell: cellReference
      });
    });
  });

  return dataAsObject;
}


// Función para insertar una fila en una hoja de cálculo
export async function appendRow(values: { nombre: string, email: string }): Promise<void> {
  await authenticate();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [Object.values(values)] //values.map(row => Object.values(row)),
    },
  });
}
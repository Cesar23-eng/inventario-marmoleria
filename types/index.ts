export interface MedidaIndividual {
    largo: number;
    ancho: number;
}

export interface Placa {
    id: string; // UUID
    nombre: string;
    material: string;
    lote: string | null;
    largo: number;
    ancho: number;
    grosor: number | null;
    cantidad_placas: number;
    medidas_individuales?: MedidaIndividual[] | null;
    ubicacion: string | null;
    precio_m2: number | null;
    imagen_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Herramienta {
    id: string; // UUID
    nombre: string;
    categoria: string;
    cantidad_disponible: number;
    imagen_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * Calcula el total de m² de una placa.
 * - Si tiene medidas_individuales: suma largo × ancho de cada placa individual
 * - Si no (todas iguales): cantidad_placas × largo × ancho
 */
export function calcularM2Total(placa: Placa): number {
    if (placa.medidas_individuales && placa.medidas_individuales.length > 0) {
        const total = placa.medidas_individuales.reduce(
            (sum, m) => sum + (m.largo * m.ancho), 0
        );
        return Math.round(total * 100) / 100;
    }
    return Math.round(placa.cantidad_placas * placa.largo * placa.ancho * 100) / 100;
}

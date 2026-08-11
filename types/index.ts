export interface Placa {
    id: string; // UUID
    nombre: string;
    material: string;
    lote: string | null;
    largo: number;
    ancho: number;
    grosor: number;
    metros_cuadrados_iniciales: number;
    metros_cuadrados_sobrantes: number;
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

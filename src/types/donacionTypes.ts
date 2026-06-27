export interface DonacionRequest {
    tipo: string;
    cantidad: number;
    donanteNombre: string;
};

export interface DonacionResponse {
    id: number;
    tipo: string;
    cantidad: number;
    donanteNombre: string;
    fecha: string;
};

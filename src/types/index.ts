/** 
  @module types/index
  @author Remi García
  @description: Interfaces TypeScript que definen la estructura de los datos
  que se intercambian entre el frontend y el backend de Donaton.
 
  Estas interfaces actúan como un contrato: garantizan que los datos que llegan
  del backend tengan exactamente la forma que el frontend espera. Si el backend
  cambia un campo, TypeScript mostrará un error en compilación antes de que
  el problema llegue al usuario.
 
  Todas las interfaces están alineadas con el schema de Prisma del backend
  (archivo prisma/schema.prisma en el repositorio backend-donaton).
 */

/**
  @interface: Usuario
  @description: Representa a un usuario interno del sistema Donaton.
  Los usuarios internos son los que operan la plataforma: administradores,
  coordinadores y voluntarios. A diferencia del donante, el usuario requiere
  autenticación para acceder al sistema.
  id: identificador único del usuario en la base de datos.
  nombre: nombre de pila del usuario.
  apellido: apellido del usuario.
  correo: correo electrónico usado como identificador de login. Debe ser único.
  rol: determina a qué paneles puede acceder. ADMIN tiene acceso total,
  COORDINADOR gestiona donaciones y necesidades, VOLUNTARIO registra donaciones en terreno.
  fecha: fecha de creación del registro.
 */
export interface Usuario {
  id: number
  nombre: string
  apellido: string
  correo: string
  rol: 'ADMIN' | 'COORDINADOR' | 'VOLUNTARIO'
  fecha: string
}

/** 
  @interface Donacion
  @description: Representa una donación en el sistema Donaton.
  Es la entidad central del sistema: cada donación pasa por un ciclo de vida
  definido por estados desde que el donante la registra hasta que es entregada.
  El ciclo de estados es: PENDIENTE → RECIBIDA → DISPONIBLE → ASIGNADA → EN_TRANSITO → ENTREGADA.
  id: identificador único. Se usa también para generar el código OT.
  tipo: descripción del bien donado. Ejemplo: Ropa, Alimentos, Agua.
  cantidad: cantidad numérica del bien donado.
  unidad: unidad de medida. Ejemplo: unidades, cajas, litros.
  origen: descripción de la procedencia de la donación.
  estado: posición actual dentro del ciclo de vida. El backend valida que
  las transiciones sean secuenciales y no se puedan saltar pasos.
  ot: código único de seguimiento generado cuando el coordinador confirma
  la recepción física. Formato OT-AÑO-XXXX. Es null mientras esté en PENDIENTE.
  fecha: fecha de registro.
  donanteId: identificador del donante vinculado. null si no se registró donante.
  usuarioId: identificador del usuario interno que registró la donación. null si fue el donante.
  necesidadId: identificador de la necesidad asignada. null si aún no se asignó.
  centroAcopioId: identificador del centro de acopio asociado. null si no se especificó.
 */
export interface Donacion {
  id: number
  tipo: string
  cantidad: number
  unidad: string
  origen: string
  estado: 'PENDIENTE' | 'RECIBIDA' | 'DISPONIBLE' | 'ASIGNADA' | 'EN_TRANSITO' | 'ENTREGADA'
  ot: string | null
  fecha: string
  donanteId: number | null
  usuarioId: number | null
  necesidadId: number | null
  centroAcopioId: number | null
}

/** 
  @interface: Necesidad
  @description: Representa una necesidad humanitaria reportada en el sistema.
  Las necesidades son publicadas por los coordinadores y son visibles en el
  portal público para que los donantes sepan qué se requiere realmente.
  Cada necesidad tiene una barra de cobertura que se actualiza automáticamente
  cuando se le asignan donaciones.
  id: identificador único de la necesidad.
  categoria: tipo de bien requerido. Ejemplo: Alimentos, Ropa de abrigo.
  prioridad: nivel de urgencia. CRITICA requiere atención inmediata, ALTA es urgente,
  MEDIA tiene margen de tiempo, BAJA es deseable pero no urgente.
  cantRequerida: cantidad total del bien necesaria para cubrir la necesidad.
  cantCubierta: cantidad ya cubierta por donaciones asignadas. Cuando iguala
  o supera cantRequerida, el sistema actualiza el estado a CUBIERTA automáticamente.
  estado: ACTIVA significa que requiere donaciones y es visible en el portal público,
  CUBIERTA significa que la cantidad requerida fue alcanzada,
  CERRADA significa que fue cerrada manualmente por el coordinador.
  fecha: fecha de registro.
  comunaId: identificador de la comuna donde se requiere el bien.
  comuna: objeto con el nombre de la comuna, incluido por el backend mediante
  una consulta que une las tablas Necesidad y Comuna para no enviar datos innecesarios.
  usuarioId: identificador del coordinador que registró la necesidad.
 */
export interface Necesidad {
  id: number
  categoria: string
  prioridad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  cantRequerida: number
  cantCubierta: number
  estado: 'ACTIVA' | 'CUBIERTA' | 'CERRADA'
  fecha: string
  comunaId: number
  comuna: { nombre: string }
  usuarioId: number
}

/** 
  @interface: Asignacion
  @description: Representa el vínculo entre una donación disponible y una necesidad activa.
  Cuando el coordinador asigna una donación a una necesidad, se crea un registro
  de Asignacion que permite rastrear quién es responsable de la entrega.
  id: identificador único de la asignación.
  estado: ASIGNADA significa que la donación fue vinculada a la necesidad,
  EN_TRANSITO significa que está en camino al destino,
  ENTREGADA significa que llegó a su destino y el ciclo está completo.
  fechaAsignacion: fecha en que se creó la asignación.
  fechaEntrega: fecha en que se confirmó la entrega. null si aún no se ha entregado.
  donacionId: identificador de la donación asignada.
  necesidadId: identificador de la necesidad que se está cubriendo.
  responsableId: identificador del usuario responsable de realizar la entrega.
 */
export interface Asignacion {
  id: number
  estado: 'ASIGNADA' | 'EN_TRANSITO' | 'ENTREGADA'
  fechaAsignacion: string
  fechaEntrega: string | null
  donacionId: number
  necesidadId: number
  responsableId: number
}

/** 
  @interface: Login
  @description: Datos que el usuario ingresa en el formulario de inicio de sesión.
  email: correo electrónico del usuario.
  password: contraseña del usuario.
 /
export interface Login {
  email: string
  password: string
}

/** 
  @interface: AuthResponse
  @description: Respuesta del backend al iniciar sesión correctamente.
  Contiene el token de sesión y los datos del usuario autenticado.
  token: identificador de sesión que el frontend envía en cada petición al backend
  para demostrar que el usuario está autenticado.
  usuario: datos del usuario que inició sesión.
 */
export interface AuthResponse {
  token: string
  usuario: Usuario
}
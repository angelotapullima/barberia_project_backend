# Plan de Migración de Base de Datos y Refactorización

**Documento creado el:** 15 de agosto de 2025
**Última actualización:** 15 de agosto de 2025

## 1. Contexto y Objetivos

Esta migración busca simplificar la lógica de negocio, mejorar el rendimiento y la eficiencia (minimizando llamadas a la API para reducir costos de infraestructura), y aumentar la integridad y escalabilidad de la aplicación.

---

## 2. Plan de Acción por Fases

### Fase 0: Planificación y Análisis

- [x] Análisis de los requisitos del negocio.
- [x] Diseño y validación del nuevo esquema de base de datos.
- [x] Creación de este documento de planificación.
- [x] Análisis exhaustivo del código del Backend y Frontend para evaluar el impacto completo.
- [x] Definición de estrategia de API Híbrida para optimización de costos.

### Fase 1: Implementación del Nuevo Esquema

- [ ] **Paso 1.1: Aplicar el Nuevo Esquema:** Ejecutar el script `src/schema_new.sql` en la base de datos de desarrollo.
- [x] **Paso 1.2: Crear Archivo de Datos de Prueba `seed_new.sql`:** Se ha creado un script con datos de prueba para el nuevo esquema.

### Fase 2: Refactorización del Código del Backend

**Estrategia de API Híbrida:** Para optimizar costos, se crearán endpoints agregados que sirvan todos los datos necesarios para las vistas de alto tráfico en una sola llamada. Para las vistas de administración (CRUDs), se mantendrán los endpoints RESTful estándar.

- [x] **Módulos CRUD (Productos, Servicios, etc.):**
  - [x] Crear `product.routes.ts`, `product.controller.ts`, `product.service.ts` para el CRUD de productos.
  - [x] Modificar el módulo de `services` para que solo maneje servicios.
- [x] **Eliminación del Sistema de "Borradores" (Drafts):**
  - [x] Eliminar todos los archivos y referencias a `draftSale` en el proyecto.
- [x] **Refactorización del Flujo de Reservas y Ventas:**
  - [x] Adaptar los servicios de `reservations` y `sales` a la nueva lógica de `reservation_products` y al nuevo esquema de ventas.
- [x] **Endpoints Agregados y Reportes:**
  - [x] **Endpoint para Dashboard (Nuevo):** Crear `GET /api/dashboard/summary`.
  - [x] **Endpoint para Vista de Calendario (Nuevo):** Crear `GET /api/calendar-view-data` que devuelva `{ reservations, barbers, services }`.
  - [x] **Endpoint para Datos Maestros de Venta (Nuevo):** Crear `GET /api/pos-master-data` que devuelva `{ services, products }`.
  - [x] **Reportes:** Reescribir todos los servicios de reportes (`report.service.ts`) para que funcionen con el nuevo esquema y la nueva vista de comisiones.
  - [x] **Endpoint para Pagos a Barberos (Histórico):** Crear `GET /api/barber-commissions` para obtener los registros de pagos calculados.

### Fase 3: Refactorización del Código del Frontend

- [x] **Fase 3.1: Adaptar Stores de Pinia/Vuex:**
  - [x] Adaptar todos los stores (`productStore`, `serviceStore`, `salesStore`, `reservationStore`, `reportStore`) para que se comuniquen con los nuevos endpoints (tanto los CRUD como los agregados).
- [x] **Fase 3.2: Refactorizar Vistas y Componentes:**
  - [x] **Vistas de Alto Tráfico:**
    - [x] `DashboardView.vue`: Refactorizar para que use el endpoint `GET /api/dashboard/summary`.
    - [x] `CalendarView.vue`: Refactorizar para que use el endpoint `GET /api/calendar-view-data`.
    - [x] `SaleRegistrationModal.vue`: Refactorizar para usar `GET /api/pos-master-data` y la nueva lógica de `reservation_products`.
  - [x] **Vistas CRUD y Reportes:**
    - [x] Adaptar todas las vistas de gestión (CRUD) y reportes para que funcionen con las nuevas respuestas de la API.

### Fase 4: Verificación y Pruebas

- [ ] Probar todos los endpoints y el flujo completo de la aplicación de punta a punta.

### Fase 5: Migración de Datos (Opcional/Producción)

- [ ] Planificar y ejecutar la migración de los datos si es necesario.

### Fase 6: Mejoras Futuras (Módulo Administrativo y Contable)

- [ ] **Gestión de Pagos a Proveedores:**
  - [ ] Nuevas tablas: `suppliers`, `purchases`, `purchase_items`.
  - [ ] Flujos para registrar compras y pagos a proveedores.
  - [ ] Integración con `inventory_movements` (entradas por compras).
- [ ] **Registro de Pagos a Colaboradores:**
  - [ ] Tabla `payroll_transactions` para registrar pagos reales a barberos.
- [ ] **Gestión de Cuentas/Facturas:**
  - [ ] Tablas para `bills`, `bill_payments`.
  - [ ] Flujos para registrar y pagar facturas de gastos.
- [ ] **Reportes Contables Básicos:**
  - [ ] Reportes de ingresos vs. gastos, flujo de caja.

---

## 3. Próximos Pasos Inmediatos

1.  **Aplicar Esquema (Paso 1.1):** El usuario debe ejecutar `src/schema_new.sql` en la base de datos de desarrollo.
2.  **Cargar Datos de Prueba:** Ejecutar `src/seed_new.sql` en la base de datos de desarrollo.
3.  **Iniciar Fase 4 (Verificación y Pruebas):** Probar la aplicación de punta a punta.

# Plan de Migración: Refactorización del Cálculo de Pagos a Barberos (Versión 5)

## El Porqué (La Necesidad del Cambio)

Este plan ha evolucionado para reflejar los desafíos encontrados durante la implementación. La versión final adopta los siguientes enfoques:

1.  **Cálculo en Vivo:** Se abandonó el modelo de "pre-cálculo" en favor de un cálculo "just-in-time" que se ejecuta al consultar el reporte. Esto simplifica el flujo y convierte a `barber_commissions` en un registro histórico limpio.
2.  **Página Dedicada para Pagos:** Debido a problemas de CSS persistentes e irresolubles con el componente de modal genérico, se ha tomado la decisión estratégica de reemplazar el modal de pago por una página dedicada. Esto garantiza un funcionamiento robusto y sin problemas de visualización.

---

## El Plan (Tareas a Realizar)

**Fase 1-4: Backend, Frontend, Correcciones y Refactorización de Adelantos - COMPLETADAS**

**Fase 5: Página de Pago y Mejoras de Navegación - COMPLETADA**

- [x] **Crear Componente `Breadcrumbs.vue`:** Desarrollar un componente de "migas de pan" reutilizable que muestre la ruta de navegación actual (ej: `Inicio > Reportes > Confirmar Pago`).

- [x] **Crear Vista de Pago:** Crear un nuevo componente `PaymentConfirmationView.vue`. El contenido del `BarberPaymentModal.vue` se moverá aquí.

- [x] **Integrar Breadcrumbs:** Añadir el nuevo componente `Breadcrumbs.vue` a la `PaymentConfirmationView.vue` para guiar al usuario.

- [x] **Añadir Ruta de Pago:** Añadir una nueva ruta en `src/router/index.js` que apunte a la nueva vista de confirmación de pago.

- [x] **Actualizar Flujo Principal:** Modificar el botón "Pagar" en la vista de reportes para que navegue a la nueva página de confirmación.

- [x] **Eliminar Modal de Pago:** Eliminar el componente `BarberPaymentModal.vue`.

**Fase 6: Verificación Final**

- [ ] **Prueba Funcional de Extremo a Extremo:** Realizar las pruebas completas del flujo de pagos (usando la nueva página) y adelantos.

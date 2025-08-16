# Plan de Desarrollo del Módulo "Pagos a Barberos"

## 1. Resumen del Módulo
Este módulo tiene como objetivo gestionar el proceso de cálculo y pago de comisiones a los barberos de forma mensual, permitiendo también el registro de adelantos y la visualización detallada de los servicios que contribuyen a sus ganancias.

## 2. Flujo de Trabajo Detallado (según lo especificado por el usuario)
*   **Pagos Mensuales:** Los pagos son mensuales, habilitados **a partir** del último día del mes.
*   **Adelantos:** Los días previos al fin de mes son exclusivamente para adelantos.
*   **Vista Principal:**
    *   Debe mostrar a todos los barberos.
    *   Debe tener un filtro por mes (ya que el pago es mensual).
    *   **Columnas de la tabla:** Nombre del Barbero, Período (Mes), Monto Total, Estado.
    *   **Botones Condicionales:**
        *   "Pagar": Habilitado solo el último día del mes.
        *   "Adelanto": Habilitado antes del último día del mes.
*   **Detalle en Acordeón:** Cada fila de barbero debe tener un acordeón que liste:
    *   Todos los servicios por los cuales se le está pagando (nombre del servicio, día, monto, contribuyendo a su producción).
    *   Todos los adelantos que tuvo el barbero.
*   **Acción "Pagar" (Modal/Vista):** Al hacer clic en "Pagar":
    *   Debe aparecer una vista o modal.
    *   Mostrar el nombre del barbero.
    *   Mostrar el monto total a pagar (con cálculo respectivo y descuentos).
    *   Mostrar una tabla con todos los servicios por los cuales está cobrando (nombre del servicio, día, monto, sumando a su producción).
    *   Botón "Pagar" para finalizar el pago.
    *   Opción de imprimir el detalle para registros.

## 3. Plan de Desarrollo Paso a Paso

### Fase 1: Backend - Cálculo de Datos y Endpoints API
Esta fase se enfoca en la lógica de negocio y la exposición de datos a través de la API.

*   **Objetivo:** Implementar las funciones de cálculo de comisiones, recuperación de datos detallados y finalización de pagos.

    *   **`barber_commissions` table:**
        *   Asegurar que puede almacenar todos los datos necesarios para cálculos mensuales.
        *   Añadir columna `updated_at`.
        *   Añadir `CONSTRAINT unique_barber_period UNIQUE (barber_id, period_start, period_end)`.
        *   **Estado:** ✅ `updated_at` añadido. ✅ `unique_barber_period` añadido.

    *   **`barberCommissions.service.ts`:**
        *   ✅ `calculateMonthlyCommissions(year, month)`: Calcula y almacena comisiones mensuales para todos los barberos.
        *   ✅ `getMonthlyBarberCommissions(year, month)`: Recupera resúmenes de comisiones mensuales.
        *   ✅ `getBarberServicesForMonth(barberId, year, month)`: Recupera servicios detallados por barbero y mes.
        *   ✅ `getBarberAdvancesForMonth(barberId, year, month)`: Recupera adelantos detallados por barbero y mes.
        *   ✅ `finalizeBarberPayment(commissionId)`: Actualiza el estado de una comisión a 'pagado'.

    *   **`barberCommissions.controller.ts`:**
        *   ✅ `calculateMonthlyCommissionsController`: Expone `calculateMonthlyCommissions`.
        *   ✅ `getMonthlyBarberCommissionsController`: Expone `getMonthlyBarberCommissions`.
        *   ✅ `getBarberServicesForMonthController`: Expone `getBarberServicesForMonth`.
        *   ✅ `getBarberAdvancesForMonthController`: Expone `getBarberAdvancesForMonth`.
        *   ✅ `finalizeBarberPaymentController`: Expone `finalizeBarberPayment`.

    *   **`barberCommissions.routes.ts`:**
        *   ✅ Rutas para todos los controladores anteriores.

### Fase 2: Frontend - Visualización e Interacción
Esta fase se enfoca en la interfaz de usuario y la interacción con los nuevos endpoints del backend.

*   **Objetivo:** Construir la vista del reporte de pagos, incluyendo filtros, tabla, acordeones y el modal de pago.

    *   **`src/views/BarberPaymentsReportView.vue`:**
        *   ✅ Implementar el filtro mensual.
        *   Mostrar la tabla con las columnas especificadas.
        *   ✅ Implementar la lógica condicional para los botones "Pagar" y "Adelanto".
        *   ✅ Implementar el acordeón para mostrar detalles de servicios y adelantos.
    *   **Componentes Adicionales:**
        *   ✅ Crear un componente para el modal/vista de la acción "Pagar".
    *   **Integración de API:**
        *   Realizar llamadas a los nuevos endpoints del backend para obtener y enviar datos.

### Fase 3: Refinamiento y Pruebas
*   **Objetivo:** Asegurar la funcionalidad completa, la precisión de los cálculos y una experiencia de usuario fluida.

    *   Implementar lógica de cálculo para descuentos y monto final en el modal de pago.
    *   Implementar funcionalidad de impresión del detalle de pago.
    *   Realizar pruebas exhaustivas de todas las funcionalidades del módulo.

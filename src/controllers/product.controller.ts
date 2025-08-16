import { Request, Response } from 'express';
import * as productService from '../services/product.service';

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene todos los productos.
 *     description: Retorna una lista de todos los productos disponibles en el sistema.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: number
 *                   # ... (otras propiedades del producto)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID.
 *     description: Retorna los detalles de un producto específico.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a obtener.
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await productService.getProductById(id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto.
 *     description: Añade un nuevo producto al inventario.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del producto.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Precio del producto.
 *               stock:
 *                 type: integer
 *                 description: Cantidad inicial en stock.
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: number
 *       400:
 *         description: Datos de entrada inválidos o incompletos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto existente.
 *     description: Actualiza los detalles de un producto específico por su ID.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del producto.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio del producto.
 *               stock:
 *                 type: integer
 *                 description: Nueva cantidad en stock.
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: number
 *       400:
 *         description: Datos de entrada inválidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedProduct = await productService.updateProduct(id, req.body);
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Desactiva un producto.
 *     description: Marca un producto como inactivo en lugar de eliminarlo permanentemente.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a desactivar.
 *     responses:
 *       200:
 *         description: Producto desactivado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedProduct = await productService.deleteProduct(id);
    if (deletedProduct) {
        res.status(200).json({ message: 'Product deactivated successfully' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating product', error });
  }
};
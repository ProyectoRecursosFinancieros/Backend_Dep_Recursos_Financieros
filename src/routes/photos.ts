import { Router, Request, Response } from "express";
import { Photo } from "../models/Photo";

const router = Router();

// GET /api/photos - List all photos
router.get("/", async (_req: Request, res: Response) => {
  const photos = await Photo.findAll({ order: [["capturedAt", "DESC"]] });
  res.json(photos);
});

// GET /api/photos/:id - Get a single photo
router.get("/:id", async (req: Request, res: Response) => {
  const photo = await Photo.findByPk(Number(req.params.id));
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  res.json(photo);
});

// POST /api/photos - Create a photo record
router.post("/", async (req: Request, res: Response) => {
  const { imagePath, latitude, longitude, address } = req.body;
  if (!imagePath || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: "imagePath, latitude and longitude are required" });
    return;
  }
  const photo = await Photo.create({ imagePath, latitude, longitude, address });
  res.status(201).json(photo);
});

// DELETE /api/photos/:id - Delete a photo record
router.delete("/:id", async (req: Request, res: Response) => {
  const photo = await Photo.findByPk(Number(req.params.id));
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  await photo.destroy();
  res.status(204).send();
});

export default router;

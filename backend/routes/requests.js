const express = require("express");
const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Ajouter ici la logique pour traiter la demande interne
    res.json({ message: "Demande interne envoyée" });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

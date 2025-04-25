import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";
import { motion } from "framer-motion";

// Inscription des modules Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

// Types pour les demandes
export type RequestStatus =
  | "new"
  | "assigned"
  | "in-progress"
  | "completed"
  | "rejected";

export type RequestType =
  | "registration"
  | "selection-tests"
  | "accident-report"
  | "responsibility-waiver";

export interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  date: Date; // On suppose ici que 'date' correspond à la date de création de la demande
  status: RequestStatus;
  assignedTo?: string | null;
}

interface StatisticsCardProps {
  requests: Request[];
}

// Carte statique avec les compteurs (ancienne version)
const GridStatsCard: React.FC<StatisticsCardProps> = ({ requests }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };
  return (
    <motion.div
      className="mb-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des demandes</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rwdm-blue">
                      {requests.filter((r) => r.status === "new").length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Nouvelles demandes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rwdm-blue">
                      {
                        requests.filter(
                          (r) =>
                            r.status === "in-progress" &&
                            r.type !== "accident-report"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Demandes en cours
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rwdm-blue">
                      {requests.filter((r) => r.status === "completed").length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Demandes complétées
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rwdm-blue">
                      {
                        requests.filter(
                          (r) =>
                            r.type === "accident-report" &&
                            r.status === "in-progress"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Accidents en attente
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Carte graphique linéaire
const LineChartCard: React.FC<StatisticsCardProps> = ({ requests }) => {
  // Définition des mois
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  // Types de demandes à comparer
  const types: RequestType[] = [
    "registration",
    "selection-tests",
    "accident-report",
    "responsibility-waiver",
  ];

  // Initialisation d'un objet pour stocker les compteurs par type pour chaque mois
  const dataPerType: { [key in RequestType]: number[] } = {
    registration: new Array(12).fill(0),
    "selection-tests": new Array(12).fill(0),
    "accident-report": new Array(12).fill(0),
    "responsibility-waiver": new Array(12).fill(0),
  };

  // Incrémentation des compteurs pour chaque demande
  requests.forEach((req) => {
    const month = new Date(req.date).getMonth(); // 0 pour Janvier, 11 pour Décembre
    if (types.includes(req.type)) {
      dataPerType[req.type][month] += 1;
    }
  });

  // Préparation des données pour le graphique
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Inscription à l'académie",
        data: dataPerType.registration,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        fill: false,
      },
      {
        label: "Tests de sélection",
        data: dataPerType["selection-tests"],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        fill: false,
      },
      {
        label: "Déclaration d'accident",
        data: dataPerType["accident-report"],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        fill: false,
      },
      {
        label: "Décharge de responsabilité",
        data: dataPerType["responsibility-waiver"],
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Demandes par type sur l'année",
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des demandes sur l'année</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({ requests }) => {
  return (
    <div className="space-y-6">
      <GridStatsCard requests={requests} />
      <LineChartCard requests={requests} />
    </div>
  );
};

export default StatisticsCard;

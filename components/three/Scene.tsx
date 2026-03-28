import RestaurantModel from "./RestaurantModel";
import Table from "./Table";
import { useStore } from "@/lib/store";

interface RestaurantData {
  model: string;
  tables: { id: string; position: [number, number, number]; rotation?: [number, number, number]; reserved: boolean }[];
}

export default function Scene({ restaurantData }: { restaurantData: RestaurantData }) {
  const { tables, reserveTable } = useStore();

  return (
    <>
      <ambientLight intensity={0.5} />
      <RestaurantModel modelPath={restaurantData.model} />
      {restaurantData.tables.map((t) => (
        <Table
          key={t.id}
          id={t.id}
          position={t.position}
          rotation={t.rotation}
          reserved={t.reserved}
          onClick={reserveTable}
        />
      ))}
    </>
  );
}
import Scene from "@/components/three/Scene";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;

  // TODO: fetch real restaurant data from API/DB using `id`
  const restaurantData = {
    model: `/models/${id}.glb`,
    tables: [] as { id: string; position: [number, number, number]; rotation?: [number, number, number]; reserved: boolean }[],
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Scene restaurantData={restaurantData} />
    </div>
  );
}

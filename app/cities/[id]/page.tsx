import { notFound } from "next/navigation";

import CityDetailsClient from "./CityDetailsClient";

type CityDetailsPageProps = {
    params: Promise<{ id: string }>;
};

const CityDetailsPage = async ({ params }: CityDetailsPageProps) => {
    const { id } = await params;
    const cityId = Number(id);

    if (!Number.isFinite(cityId)) {
        notFound();
    }

    return <CityDetailsClient cityId={cityId} />;
};

export default CityDetailsPage;

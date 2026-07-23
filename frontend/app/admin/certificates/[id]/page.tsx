import { LiveCustomerAssetPreviewPage } from "@/components/admin/live-detail-pages"

export default function CertificatePreviewPage({ params }: { params: { id: string } }) {
  return <LiveCustomerAssetPreviewPage id={params.id} kind="certificate" />
}

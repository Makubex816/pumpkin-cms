import { OutboundLinkDetailView } from '@/components/outbound-links/OutboundLinkAdmin'

export default function OutboundLinkDetailPage({ params }: { params: { id: string } }) {
  return <OutboundLinkDetailView linkId={params.id} />
}

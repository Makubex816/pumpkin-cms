import { OutboundLinkInstancesView } from '@/components/outbound-links/OutboundLinkAdmin'

export default function OutboundLinkDetailInstancesPage({ params }: { params: { id: string } }) {
  return <OutboundLinkInstancesView linkId={params.id} />
}

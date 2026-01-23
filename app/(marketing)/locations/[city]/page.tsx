interface Props { params: { city: string } }
export default function CityPage({ params }: Props) {
  return <div>Location: {params.city}</div>
}

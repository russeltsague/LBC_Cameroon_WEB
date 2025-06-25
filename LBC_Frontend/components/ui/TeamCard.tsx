'use client'

import Image from 'next/image'
import Link from 'next/link'

type TeamCardProps = {
  id: string
  name: string
  city: string
  logo: string
  category: string
}

export function TeamCard({ id, name, city, logo, category }: TeamCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Logo section — black background for now */}
      <div className="relative h-48 w-full bg-black">
        {/* 
        Uncomment the Image component below when you're ready to display team logos.
        <Image
          src={logo}
          alt={name}
          fill
          className="object-cover"
        />
        */}
      </div>

      {/* Team details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
            {category}
          </span>
        </div>
        <p className="text-gray-300 mb-4">{city}</p>
        <Link 
          href={`/teams/${id}`}
          className="inline-block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors"
        >
          View Team
        </Link>
      </div>
    </div>
  )
}

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
      <div className="relative h-32 sm:h-48 w-full bg-black">
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
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
          <h3 className="text-base sm:text-xl font-bold text-white truncate flex-1 mr-0 sm:mr-2 mb-1 sm:mb-0">{name}</h3>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded self-start sm:self-auto">
            {category}
          </span>
        </div>
        <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm">{city}</p>
        <Link 
          href={`/teams/${id}`}
          className="inline-block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 sm:px-4 rounded transition-colors text-xs sm:text-sm"
        >
          Voir l'équipe
        </Link>
      </div>
    </div>
  )
}

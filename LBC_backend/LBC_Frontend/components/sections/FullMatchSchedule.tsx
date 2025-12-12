'use client';

import React from 'react';

// Types for our static data
type Match = {
    category: string;
    time: string;
    teamA: string;
    teamB: string;
    court: string;
    day: string; // 'Journée' column
};

type LocationSchedule = {
    name: string;
    matches: Match[];
};

type DateSchedule = {
    date: string; // e.g., "Samedi, 28 juin 2025"
    locations: LocationSchedule[];
};

// Static data from the images
const scheduleData: DateSchedule[] = [
    {
        date: 'Samedi, 28 juin 2025',
        locations: [
            {
                name: 'ESPLANADE DU PAPOSY',
                matches: [
                    { category: 'U18 Garçons', time: '11H30', teamA: 'PEPINIERE', teamB: 'ELCIB', court: '2', day: '' },
                    { category: '', time: '13H00', teamA: 'DREAM BB', teamB: 'ACPBA', court: '2', day: '' },
                    { category: 'L1 Messieurs', time: '14H30', teamA: 'WILDCATS', teamB: 'ONYX', court: '2', day: '' },
                    { category: '', time: '14H30', teamA: 'NYBA', teamB: 'FRIENDSHIP', court: '1', day: '' },
                    { category: '', time: '16H00', teamA: 'ALPH', teamB: '512 SA', court: '2', day: '' },
                    { category: '', time: '16H00', teamA: 'BEAC', teamB: 'FALCONS', court: '1', day: '' },
                ]
            },
            {
                name: "LYCEE BILINGUE D'ESSOS",
                matches: [
                    { category: 'U18 Filles', time: '10H00', teamA: 'PLAY2LEAD', teamB: 'LENA', court: '2', day: '' },
                    { category: '', time: '10H00', teamA: 'SANTA BARBARA', teamB: '3A BB', court: '1', day: '' },
                    { category: '', time: '11H30', teamA: 'FX VOGT', teamB: 'FAP', court: '2', day: '' },
                    { category: '', time: '11H30', teamA: 'FUSEE', teamB: 'FRIENDSHIP', court: '1', day: '' },
                    { category: '', time: '13H00', teamA: 'MARIK KOES', teamB: 'FALCONS', court: '2', day: '' },
                    { category: '', time: '13H00', teamA: 'PLAY2LEAD', teamB: 'ETOUDI', court: '1', day: '' },
                    { category: 'U18 Garçons', time: '14H30', teamA: 'EAST BB', teamB: 'FUSEE', court: '2', day: '' },
                    { category: '', time: '14H30', teamA: 'PHISLAMA', teamB: 'FAP', court: '1', day: '' },
                    { category: '', time: '16H00', teamA: 'SANTA BARBARA', teamB: '3A BB', court: '2', day: '' },
                    { category: '', time: '16H00', teamA: 'FRIENDSHIP', teamB: 'KLOES YDE2', court: '1', day: '' },
                ]
            }
        ]
    },
    {
        date: 'Dimanche, 29 juin 2025',
        locations: [
            {
                name: 'ESPLANADE PAPOSY',
                matches: [
                    { category: 'U18 Garçons', time: '10H00', teamA: 'FUSEE', teamB: 'MC NOAH', court: '2', day: '' },
                    { category: '', time: '10H00', teamA: '512 SA', teamB: 'ETOUDI', court: '1', day: '' },
                    { category: '', time: '11H30', teamA: 'EAST BB', teamB: 'JOAKIM BB', court: '2', day: '' },
                    { category: '', time: '11H30', teamA: 'ALPH1', teamB: 'MARY JO', court: '1', day: '' },
                    { category: '', time: '13H00', teamA: 'GREEN CITY', teamB: 'COSBIE', court: '2', day: '' },
                    { category: '', time: '13H00', teamA: 'FUSEE', teamB: 'WILDCATS', court: '1', day: '' },
                    { category: 'L1 Messieurs', time: '14H30', teamA: 'ETOUDI', teamB: 'ANGELS', court: '2', day: '' },
                    { category: '', time: '14H30', teamA: '512 SA', teamB: 'ACPBA', court: '1', day: '' },
                    { category: '', time: '16H00', teamA: 'ONYX', teamB: 'NYBA', court: '2', day: '' },
                    { category: '', time: '16H00', teamA: 'WILDCATS', teamB: 'MC NOAH', court: '1', day: '' },
                ]
            },
            {
                name: "LYCEE BILINGUE D'ESSOS",
                matches: [
                    { category: 'U18 Filles', time: '10H00', teamA: 'PLAY2LEAD', teamB: 'ONYX', court: '2', day: '' },
                    { category: '', time: '11H30', teamA: 'DESBA', teamB: 'LENA', court: '2', day: '' },
                    { category: '', time: '11H30', teamA: 'SANTA BARBARA', teamB: 'FALCONS', court: '1', day: '' },
                    { category: '', time: '13H00', teamA: 'FX VOGT', teamB: 'MARIK KLOES', court: '2', day: '' },
                    { category: '', time: '13H00', teamA: 'FRIENDSHIP', teamB: '3A BB', court: '1', day: '' },
                    { category: 'U18 Garçons', time: '14H30', teamA: 'FALCONS', teamB: 'ONYX', court: '2', day: '' },
                    { category: '', time: '14H30', teamA: 'PHISLAMA', teamB: 'FRIENDSHIP', court: '1', day: '' },
                    { category: '', time: '16H00', teamA: 'MENDONG', teamB: '3A BB', court: '2', day: '' },
                    { category: '', time: '16H00', teamA: 'LENA', teamB: 'SANTA BARBARA', court: '1', day: '' },
                ]
            }
        ]
    }
];

const FullMatchSchedule = () => {
    return (
        <div className="w-full space-y-12">
            {/* Main Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider border-b-4 border-[var(--color-primary)] inline-block pb-2">
                    Programmation du 28 et 29 Juin 2025
                </h2>
            </div>

            {scheduleData.map((dateGroup, dateIndex) => (
                <div key={dateIndex} className="space-y-8 animate-slide-up" style={{ animationDelay: `${dateIndex * 0.2}s` }}>
                    {/* Date Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-px bg-gray-700 flex-grow"></div>
                        <h3 className="text-2xl font-bold text-white italic underline decoration-[var(--color-primary)] decoration-4 underline-offset-8">
                            {dateGroup.date}
                        </h3>
                        <div className="h-px bg-gray-700 flex-grow"></div>
                    </div>

                    {dateGroup.locations.map((location, locIndex) => (
                        <div key={locIndex} className="mb-8 last:mb-0">
                            {/* Location Header */}
                            <h4 className="text-xl font-bold text-[var(--color-accent)] text-center mb-4 uppercase tracking-wide">
                                {location.name}
                            </h4>

                            {/* Table Container */}
                            <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-xl bg-gray-900/50 backdrop-blur-sm">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-900 uppercase bg-gray-400/80 font-bold">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 border-r border-gray-500 w-1/6">Catégorie</th>
                                            <th scope="col" className="px-4 py-3 border-r border-gray-500 w-24">Heure</th>
                                            <th scope="col" className="px-4 py-3 border-r border-gray-500 text-center">Rencontre</th>
                                            <th scope="col" className="px-2 py-3 border-r border-gray-500 w-24 text-center">N°/Gp Terrain</th>
                                            <th scope="col" className="px-4 py-3 w-24 text-center">Journée</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {location.matches.map((match, matchIndex) => (
                                            <tr
                                                key={matchIndex}
                                                className="bg-white hover:bg-gray-50 transition-colors text-gray-900 font-medium"
                                            >
                                                <td className="px-4 py-2 border-r border-gray-300 font-bold text-gray-800">
                                                    {match.category}
                                                </td>
                                                <td className="px-4 py-2 border-r border-gray-300">
                                                    {match.time}
                                                </td>
                                                <td className="px-4 py-2 border-r border-gray-300 text-center font-bold">
                                                    {match.teamA} <span className="text-gray-500 text-xs mx-1">vs</span> {match.teamB}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-300 text-center">
                                                    {match.court}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {match.day}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Footer Note */}
            <div className="text-center text-gray-400 text-xs mt-8 pb-8">
                <p>FEDERATION CAMEROUNAISE DE BASKETBALL - LIGUE DE BASKETBALL DU CENTRE</p>
                <p>1er Étage face carrefour régie - BP 1107 YAOUNDE</p>
            </div>
        </div>
    );
};

export default FullMatchSchedule;

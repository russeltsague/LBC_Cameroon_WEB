'use client';

import React, { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, TrophyIcon, ScaleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { getCategories, getLatestReports, Report } from '@/app/lib/api';
import { Category } from '@/app/lib/api';

interface MatchResult {
  category: string;
  results: string[];
}

interface DayResults {
  day: string;
  matches: MatchResult[];
}

interface Classification {
  title: string;
  headers: string[];
  rows: string[][];
}

const SectionHeader: FC<{ icon: React.ReactNode; title: string; className?: string }> = ({
  icon,
  title,
  className = ''
}) => (
  <div className={`flex items-center mb-8 ${className}`}>
    <div className="p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mr-4 shadow-lg shadow-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
      {icon}
    </div>
    <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide">{title}</h2>
  </div>
);

const DailyMatchesTable: FC<{ day: string; matches: { category: string; results: string[] }[] }> = ({ day, matches }) => {
  // Group matches by category
  const matchesByCategory: Record<string, Array<{
    homeTeam: string;
    homeScore: string;
    awayScore: string;
    awayTeam: string;
  }>> = {};

  // Format the day in a more readable format
  const formatDay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const formattedDay = day.includes(',') || day.includes('-') ? formatDay(day) : day;

  matches.forEach(match => {
    if (!matchesByCategory[match.category]) {
      matchesByCategory[match.category] = [];
    }

    match.results.forEach(result => {
      const [homePart, awayPart] = result.split('–').map(s => s.trim());
      const homeMatch = homePart.match(/(.+?)\s+(\d+)$/);
      const awayMatch = awayPart?.match(/^(\d+)\s+(.+)$/);

      matchesByCategory[match.category].push({
        homeTeam: homeMatch ? homeMatch[1].trim() : homePart,
        homeScore: homeMatch ? homeMatch[2].trim() : '',
        awayScore: awayMatch ? awayMatch[1].trim() : '',
        awayTeam: awayMatch ? awayMatch[2].trim() : awayPart || ''
      });
    });
  });

  const shortenTeamName = (name: string) => {
    if (name.length <= 12) return name;
    return name
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .replace(/^FCB$/, 'FCB')
      .replace(/^AS$/, 'AS')
      .replace(/^[A-Z]{3}$/, name.substring(0, 8) + '..');
  };

  return (
    <div className="mb-10 glass rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30">
      <div className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-white capitalize">{formattedDay}</h3>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-white/5 text-[var(--color-primary)] rounded-full border border-white/10 self-end sm:self-auto">
            {Object.values(matchesByCategory).reduce((sum, matches) => sum + matches.length, 0)} matchs
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(matchesByCategory).map(([category, categoryMatches]) => (
            <div key={category} className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-[var(--color-primary)]/30 transition-colors">
              <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center">
                <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] mr-3 shadow-[0_0_10px_var(--color-primary)]"></div>
                <h4 className="text-sm font-bold text-white tracking-wider">{category}</h4>
                <span className="ml-auto text-xs text-gray-400">{categoryMatches.length} match{categoryMatches.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-white/5">
                {categoryMatches.map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="px-5 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-1 text-right pr-4">
                        <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate" title={match.homeTeam}>
                          <span className="sm:hidden">{shortenTeamName(match.homeTeam)}</span>
                          <span className="hidden sm:inline">{match.homeTeam}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 mx-2">
                        {match.homeScore && match.awayScore ? (
                          <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                            <span className={`w-8 text-center text-base font-bold ${parseInt(match.homeScore) > parseInt(match.awayScore) ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                              {match.homeScore}
                            </span>
                            <span className="text-gray-500 text-xs">-</span>
                            <span className={`w-8 text-center text-base font-bold ${parseInt(match.awayScore) > parseInt(match.homeScore) ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                              {match.awayScore}
                            </span>
                          </div>
                        ) : (
                          <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20 whitespace-nowrap">
                            À venir
                          </div>
                        )}
                      </div>

                      <div className="flex-1 pl-4">
                        <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate" title={match.awayTeam}>
                          <span className="sm:hidden">{shortenTeamName(match.awayTeam)}</span>
                          <span className="hidden sm:inline">{match.awayTeam}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 bg-black/20 border-t border-white/5 text-right">
        <span className="text-xs text-gray-500">
          Mis à jour à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const ClassificationTable: FC<{ data: Classification }> = ({ data }) => {
  const isTopFour = (index: number) => index < 4;

  const getShortHeader = (header: string) => {
    const shortMap: Record<string, string> = {
      'RANG': '#',
      'EQUIPES': 'ÉQUIPE',
      'Matchs joués': 'MJ',
      'Victoires': 'V',
      'Défaites': 'D',
      'Points': 'PTS',
      'Points scorés': 'PTS+',
      'Différence': 'DIFF',
      'Pts': 'PTS',
      'J': 'J',
      'G': 'V',
      'P': 'D',
      'PP': 'PP',
      'PC': 'PC',
      'N': 'N',
      'BP': 'BP',
      'BC': 'BC',
      'DB': 'DB',
      'Pénalités': 'PEN',
      'Pts.': 'PTS',
    };
    return shortMap[header] || header;
  };

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="min-w-max w-full">
        <div className="mb-4 flex items-center space-x-2">
          <div className="h-6 w-1 bg-[var(--color-primary)] rounded-full"></div>
          <h4 className="text-lg font-bold text-white">{data.title}</h4>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-black/40">
              <tr>
                {data.headers.map((header, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className={`px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${idx > 0 ? 'text-center' : ''
                      }`}
                    title={header}
                  >
                    <span className="sm:hidden">{getShortHeader(header)}</span>
                    <span className="hidden sm:inline">{header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/5">
              {data.rows.map((row, rowIdx) => {
                if (row.length === 0 || (row.length === 1 && row[0] === '')) return null;

                return (
                  <tr
                    key={rowIdx}
                    className={`transition-colors duration-200 hover:bg-white/10 ${isTopFour(rowIdx)
                        ? 'bg-[var(--color-primary)]/5'
                        : ''
                      }`}
                  >
                    {row.map((cell, cellIdx) => {
                      if (cell === '') return null;

                      const isRankCell = cellIdx === 0;
                      let rankClass = '';

                      if (isRankCell) {
                        if (rowIdx === 0) rankClass = 'text-[var(--color-primary)] font-bold text-base';
                        else if (rowIdx === 1) rankClass = 'text-gray-300 font-bold';
                        else if (rowIdx === 2) rankClass = 'text-amber-700 font-bold';
                        else rankClass = 'text-gray-500 font-medium';
                      }

                      return (
                        <td
                          key={cellIdx}
                          className={`px-3 py-3 whitespace-nowrap text-sm ${cellIdx === 0
                              ? `${rankClass}`
                              : 'text-gray-300 text-center font-medium'
                            }`}
                        >
                          {cell}
                          {isRankCell && rowIdx < 4 && (
                            <span className="ml-1 text-xs opacity-80">
                              {rowIdx === 0 ? '🏆' : rowIdx === 1 ? '🥈' : rowIdx === 2 ? '🥉' : ''}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 * i }
  })
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100
    }
  }
};

export const ReportSection: FC = () => {
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, reportsData] = await Promise.all([
          getCategories(),
          getLatestReports(10) // Get more reports for navigation
        ]);
        
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.name === 'CORPORATES') return 1;
          if (b.name === 'CORPORATES') return -1;
          return 0;
        });
        
        setCategories(sortedCategories);
        setReports(reportsData);
        
        if (sortedCategories.length > 0) {
          setSelectedCategory(sortedCategories[0].name);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // Handle case when no reports are available
  if (reports.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Aucun rapport disponible pour le moment.</p>
          <p className="text-gray-400">Les rapports seront publiés prochainement.</p>
        </div>
      </div>
    );
  }

  const currentReport = reports[currentReportIndex];
  const totalReports = reports.length;

  const goToNextReport = () => {
    setCurrentReportIndex((prevIndex) => (prevIndex + 1) % totalReports);
  };

  const goToPreviousReport = () => {
    setCurrentReportIndex((prevIndex) => (prevIndex - 1 + totalReports) % totalReports);
  };

  const goToReport = (index: number) => {
    setCurrentReportIndex(index);
  };
  const federationHeader = {
    title: 'FEDERATION CAMEROUNAISE DE BASKETBALL',
    league: 'LIGUE DE BASKETBALL DU CENTRE',
    address: '1er Étage face carrefour régie – BP 1107 YAOUNDE',
    phones: '(+237) 690 450 998 / 651 196 152',
    email: 'liguedebasketducentre@gmail.com'
  };

  const reportMeta = {
    season: currentReport.season,
    reportTitle: currentReport.reportTitle,
    date: currentReport.date,
    secretary: currentReport.secretary
  };

  const resultsA = currentReport?.resultsA ?? [];
  const decisionsB = currentReport.decisionsB;
  const sanctionsC = currentReport?.sanctionsC ?? { heading: '', columns: [], rows: [], note: '' };

  const classificationsD: Classification[] = [
    {
      title: 'CATEGORIE U18 FILLES',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'LENA', '7', '6', '1', '13', '270', '155', '+115'],
        ['2e', 'FAP', '5', '5', '0', '10', '281', '156', '+125'],
        ['3e', 'FX VOGT', '5', '4', '1', '9', '200', '105', '+95'],
        ['4e', 'MARIK KLOES', '5', '4', '1', '9', '197', '115', '+82'],
        ['5e', 'FUSEE', '6', '3', '3', '9', '250', '231', '+19'],
        ['6e', 'DESBA', '5', '3', '2', '8', '148', '160', '-12'],
        ['7e', 'SANTA BARBARA', '6', '2', '4', '8', '149', '166', '-17'],
        ['8e', 'ONYX', '4', '3', '1', '7', '164', '129', '+35'],
        ['9e', 'FRIENDSHIP', '5', '1', '4', '6', '155', '163', '-8'],
        ['10e', 'PLAY2LEAD', '5', '1', '4', '6', '141', '163', '-22'],
        ['11e', 'FALCONS', '5', '1', '4', '6', '97', '222', '-125'],
        ['12e', 'OL. DE MEYO', '5', '0', '5', '5', '12', '249', '-237'],
        ['13e', '3A BB', '4', '1', '3', '4', '84', '114', '-30']
      ]
    },
    {
      title: 'CATEGORIE U18 GARCONS – POULE A',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'FALCONS', '4', '4', '0', '8', '264', '147', '+117'],
        ['2e', 'ONYX', '4', '3', '1', '7', '186', '159', '+27'],
        ['3e', 'MC NOAH', '3', '3', '0', '6', '235', '111', '+124'],
        ['4e', '512 SA', '4', '2', '2', '6', '241', '216', '+25'],
        ['5e', 'WILDCATS', '4', '3', '1', '6', '142', '124', '+18'],
        ['6e', 'JOAKIM', '4', '1', '3', '5', '153', '241', '-88'],
        ['7e', 'ETOUDI', '3', '1', '2', '4', '140', '144', '-4'],
        ['8e', 'PLAY2LEAD', '3', '1', '2', '4', '136', '141', '-5'],
        ['9e', 'EAST BB', '4', '0', '4', '4', '160', '214', '-54'],
        ['10e', 'FUSEE', '3', '0', '3', '3', '93', '253', '-160']
      ]
    },
    {
      title: 'CATEGORIE U18 GARCONS – POULE B',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'MESSASSI', '4', '3', '1', '7', '230', '167', '+63'],
        ['2e', 'ELCIB', '4', '3', '1', '7', '212', '177', '+35'],
        ['3e', 'FAP', '3', '3', '0', '6', '152', '89', '+63'],
        ['4e', 'FRIENDSHIP', '4', '2', '2', '6', '213', '189', '+24'],
        ['5e', 'PEPINIERE', '4', '2', '2', '6', '139', '180', '-41'],
        ['6e', 'YD2 KLOES', '3', '2', '1', '5', '170', '142', '+28'],
        ['7e', 'PHISLAMA', '4', '1', '3', '5', '160', '200', '-40'],
        ['8e', 'MARY JO', '4', '1', '3', '5', '181', '229', '-48'],
        ['9e', 'ALPH1', '4', '0', '4', '4', '138', '222', '-84']
      ]
    },
    {
      title: 'CATEGORIE U18 GARCONS – POULE C',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'ACPBA', '4', '4', '0', '8', '220', '165', '+55'],
        ['2e', 'GREEN CITY', '4', '4', '0', '8', '207', '173', '+34'],
        ['3e', 'DREAM BB', '3', '3', '0', '6', '155', '76', '+79'],
        ['4e', 'MENDONG', '4', '3', '1', '6', '157', '118', '+39'],
        ['5e', 'LENA', '4', '1', '3', '5', '157', '169', '-12'],
        ['6e', 'SANTA BARBARA', '4', '1', '3', '5', '169', '182', '-13'],
        ['7e', 'COSBIE', '4', '1', '3', '5', '110', '148', '-38'],
        ['8e', 'FX VOGT', '4', '0', '4', '4', '140', '219', '-79'],
        ['9e', '3A BB', '3', '0', '3', '3', '69', '134', '-65']
      ]
    },
    {
      title: 'CATEGORIE L2B MESSIEURS',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'MBALMAYO', '7', '7', '0', '14', '396', '268', '+128'],
        ['2e', 'HAND OF GOD', '6', '5', '1', '11', '343', '277', '+66'],
        ['3e', 'OVENG BB', '5', '5', '0', '10', '380', '157', '+223'],
        ['4e', 'MBOA BB', '6', '4', '2', '10', '256', '234', '+22'],
        ['5e', 'SANTA BARBARA', '6', '3', '3', '9', '213', '236', '-23'],
        ['6e', 'EAST BB', '5', '3', '2', '8', '237', '239', '-2'],
        ['7e', 'WILDCATS', '6', '2', '4', '8', '193', '270', '-77'],
        ['8e', 'APEJES2', '6', '1', '5', '7', '210', '273', '-63'],
        ['9e', 'TEAM K SPORT', '6', '0', '6', '6', '255', '368', '-113'],
        ['10e', 'PHISLAMA', '6', '0', '6', '5', '218', '323', '-105']
      ]
    },
    {
      title: 'CATEGORIE L2A MESSIEURS – POULE A',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'EXPENDABLES', '6', '6', '0', '12', '429', '242', '+187'],
        ['2e', 'MENDONG', '5', '4', '1', '9', '290', '238', '+52'],
        ['3e', 'MESSASSI', '6', '3', '3', '9', '334', '377', '-43'],
        ['4e', 'KLOES YD2', '5', '3', '2', '8', '257', '276', '-19'],
        ['5e', 'AS KEEP', '6', '2', '4', '8', '264', '330', '-66'],
        ['6e', 'JOAKIM', '5', '2', '3', '7', '226', '238', '-12'],
        ['7e', 'WOLVES2', '5', '2', '3', '7', '196', '251', '-55'],
        ['8e', 'ALPH2', '5', '1', '4', '6', '223', '240', '-17'],
        ['9e', 'LENA', '5', '1', '4', '6', '219', '246', '-27']
      ]
    },
    {
      title: 'CATEGORIE L2A MESSIEURS – POULE B',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'APEJES', '6', '6', '0', '12', '407', '235', '+172'],
        ['2e', 'FUSEE', '6', '5', '1', '11', '304', '242', '+62'],
        ['3e', 'MARY JO', '6', '4', '2', '10', '315', '254', '+61'],
        ['4e', 'MC NOAH2', '6', '4', '2', '10', '347', '288', '+59'],
        ['5e', 'ALL SPORT', '6', '2', '4', '8', '278', '221', '+57'],
        ['6e', 'MSA', '6', '2', '4', '8', '240', '184', '+56'],
        ['7e', 'WOLVES1', '5', '3', '2', '8', '227', '184', '+43'],
        ['8e', 'SEED EXP.', '6', '0', '6', '6', '164', '408', '-244'],
        ['9e', 'BOFIA', '5', '0', '5', '5', '175', '255', '-80']
      ]
    },
    {
      title: 'CATEGORIE DAMES',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'AS KEEP', '7', '7', '0', '14', '433', '212', '+221'],
        ['2e', 'FAP', '6', '6', '0', '12', '449', '123', '+326'],
        ['3e', 'FAP2', '6', '5', '1', '11', '228', '146', '+82'],
        ['4e', 'OVERDOSE', '6', '5', '1', '10', '324', '184', '+140'],
        ['5e', 'ONYX', '7', '3', '4', '10', '309', '344', '-35'],
        ['6e', 'MC NOAH', '6', '2', '4', '8', '196', '247', '-51'],
        ['7e', 'AS KEEP2', '6', '2', '4', '8', '179', '295', '-116'],
        ['8e', 'FALCONS', '6', '1', '5', '7', '131', '352', '-221'],
        ['9e', 'LENA', '6', '0', '6', '6', '175', '319', '-144'],
        ['10e', 'MARIK KLOES', '6', '0', '6', '6', '118', '320', '-202']
      ]
    },
    {
      title: 'CATEGORIE L1 MESSIEURS',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
      rows: [
        ['1er', 'BEAC', '7', '7', '0', '14', '569', '278', '+291'],
        ['2e', 'FAP', '7', '7', '0', '14', '475', '233', '+242'],
        ['3e', 'MC NOAH', '8', '6', '2', '14', '491', '394', '+97'],
        ['4e', '512 SA', '8', '5', '3', '13', '462', '481', '-19'],
        ['5e', 'FALCONS', '7', '5', '2', '12', '453', '359', '+94'],
        ['6e', 'ALPH', '7', '5', '2', '12', '467', '385', '+82'],
        ['7e', 'WILDCATS', '7', '5', '2', '12', '430', '420', '+10'],
        ['8e', 'ACPBA', '7', '3', '4', '10', '414', '423', '-9'],
        ['9e', 'ONYX', '8', '2', '6', '10', '376', '474', '-98'],
        ['10e', 'ANGELS', '7', '2', '5', '9', '332', '464', '-132'],
        ['11e', 'LIGHT ACADEMY', '7', '1', '6', '8', '354', '426', '-72'],
        ['12e', 'FRIENDSHIP', '7', '1', '6', '8', '349', '429', '-80'],
        ['13e', 'ETOUDI', '7', '1', '6', '8', '313', '516', '-203'],
        ['14e', 'NYBA', '6', '0', '6', '6', '272', '422', '-150']
      ]
    }
  ];

  const statsE = {
    heading: 'STATISTIQUE D\'EVOLUTION DU CHAMPIONAT EN POURCENTAGE',
    note: 'NB : Ces données statistiques ne tiennent pas compte des phases de play-offs.',
    table: {
      headers: ['', 'PA', 'PB', 'PC', 'TO', 'PA', 'PB', 'TO'],
      rows: [
        ['Matchs à jouer', '78', '45', '36', '36', '117', '45', '36'],
        ['Matchs joués', '34', '18', '17', '17', '52', '30', '24'],
        ['%', '43,6', '40,00', '47,22', '47,22', '44,44', '66,66', '66,66']
      ]
    }
  };

  return (
    <motion.div
      className="pt-24 pb-16 bg-[var(--color-background)]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={container}
    >
      <div className="container px-4 sm:px-6 mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Rapports de la <span className="text-[var(--color-primary)]">Ligue</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Consultez les résultats, classements et décisions officielles
          </p>
        </motion.div>

        {/* Federation Info */}
        <motion.div
          className="text-center mb-16 p-8 glass rounded-3xl border border-white/5"
          variants={item}
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-amber-300 mb-2">
            {federationHeader.title}
          </h1>
          <p className="text-lg md:text-xl text-white font-medium tracking-wide">{federationHeader.league}</p>
          <div className="mt-4 text-sm md:text-base text-gray-400 space-y-1">
            <p>{federationHeader.address}</p>
            <p>{federationHeader.phones}</p>
            <p className="text-[var(--color-primary)]">{federationHeader.email}</p>
          </div>
        </motion.div>

        {/* Report Meta */}
        <motion.div
          className="max-w-4xl mx-auto mb-20 rounded-2xl overflow-hidden shadow-2xl"
          variants={item}
        >
          {/* Report Navigation */}
          <div className="flex justify-between items-center bg-black/40 px-6 py-4 border-b border-white/5 backdrop-blur-md">
            <button
              onClick={goToPreviousReport}
              disabled={currentReportIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentReportIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'}`}
            >
              <span className="mr-2">&larr;</span> Précédent
            </button>

            <div className="flex space-x-2">
              {reports.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReport(index)}
                  className={`w-2 h-2 rounded-full transition-all ${currentReportIndex === index ? 'bg-[var(--color-primary)] w-6' : 'bg-gray-600 hover:bg-gray-500'}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextReport}
              disabled={currentReportIndex === totalReports - 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentReportIndex === totalReports - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'}`}
            >
              Suivant <span className="ml-2">&rarr;</span>
            </button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/court-texture.png')] opacity-10 mix-blend-overlay" />
            <div className="relative z-10">
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest mb-2">{reportMeta.season}</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{reportMeta.reportTitle}</h2>
              <div className="inline-flex items-center space-x-4 text-white/90 bg-black/10 px-6 py-2 rounded-full backdrop-blur-sm">
                <span className="font-medium">{reportMeta.date}</span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="font-bold">{reportMeta.secretary}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section A: Match Results */}
        <motion.div
          className="mb-24"
          variants={container}
        >
          <SectionHeader
            icon={<CalendarIcon className="h-6 w-6" />}
            title="RÉSULTATS DES RENCONTRES"
          />

          <div className="grid gap-8">
            {resultsA.map((day, dayIndex) => (
              <motion.div
                key={dayIndex}
                variants={container}
                custom={dayIndex + 1}
              >
                <DailyMatchesTable day={day.day} matches={day.matches} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section B: Decisions */}
        <motion.div
          className="mb-24 glass rounded-3xl p-8 border border-white/10 relative overflow-hidden"
          variants={item}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <SectionHeader
            icon={<ScaleIcon className="h-6 w-6" />}
            title="DÉCISIONS"
            className="mb-6 relative z-10"
          />
          <div className="bg-white/5 rounded-xl p-6 border-l-4 border-[var(--color-primary)]">
            <p className="text-gray-200 text-lg leading-relaxed">{decisionsB}</p>
          </div>
        </motion.div>

        {/* Section C: Sanctions */}
        <motion.div
          className="mb-24"
          variants={container}
        >
          <SectionHeader
            icon={<TrophyIcon className="h-6 w-6" />}
            title={sanctionsC.heading}
          />

          <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/40">
                  <tr>
                    {sanctionsC.columns.map((column, index) => (
                      <th
                        key={index}
                        scope="col"
                        className={`px-4 py-4 text-left text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider ${index > 0 ? 'text-center' : ''
                          }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-white/5">
                  {sanctionsC.rows.map((row, rowIndex) => (
                    <motion.tr
                      key={rowIndex}
                      className="hover:bg-white/5 transition-colors"
                      variants={item}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-4 py-4 whitespace-nowrap text-sm ${cellIndex === 0 ? 'text-white font-medium' : 'text-gray-400 text-center'
                            } ${cell === 'IMPAYÉ' ? 'text-red-400 font-bold bg-red-500/10 rounded-lg px-2 py-1' : ''}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-start space-x-2 text-sm text-gray-500 bg-black/20 p-4 rounded-lg border border-white/5">
            <span className="text-[var(--color-primary)] font-bold">NB:</span>
            <p className="italic leading-relaxed">{sanctionsC.note}</p>
          </div>
        </motion.div>

        {/* Section D: Classifications */}
        <motion.div
          className="mb-24"
          variants={container}
        >
          <SectionHeader
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="CLASSEMENTS"
          />

          <div className="grid gap-12">
            {classificationsD.map((classification, index) => (
              <motion.div
                key={index}
                variants={item}
              >
                <ClassificationTable data={classification} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section E: Stats */}
        <motion.div
          className="mb-16"
          variants={container}
        >
          <SectionHeader
            icon={<ChartBarIcon className="h-6 w-6" />}
            title={statsE.heading}
          />

          <div className="glass rounded-2xl p-8 border border-white/10">
            <p className="text-sm text-gray-400 mb-6 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mr-2"></span>
              {statsE.note}
            </p>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/40">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      Catégories
                    </th>
                    <th colSpan={4} className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-l border-r border-white/10 bg-white/5">
                      U18
                    </th>
                    <th colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-l border-r border-white/10 bg-white/5">
                      L2
                    </th>
                    <th colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-l border-r border-white/10 bg-white/5">
                      Dames
                    </th>
                    <th colSpan={1} className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider bg-white/5">
                      L1
                    </th>
                  </tr>
                  <tr className="bg-black/20">
                    <th className="px-6 py-3"></th>
                    {['Filles', 'Garçons A', 'Garçons B', 'Garçons C', 'Poule A', 'Poule B', 'Poule A', 'Poule B', 'Messieurs'].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-white/5"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-white/5">
                  {statsE.table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${cellIdx === 0
                              ? 'text-white font-bold'
                              : 'text-gray-300 text-center'
                            }`}
                        >
                          {cell}
                          {cellIdx > 0 && row[0].includes('%') && (
                            <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
                              <motion.div
                                className="bg-[var(--color-primary)] h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${parseFloat(cell.replace(',', '.')) > 100 ? 100 : parseFloat(cell.replace(',', '.'))}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-xs text-gray-500 bg-black/20 p-4 rounded-lg inline-block">
              <p className="font-bold text-gray-400 mb-2 uppercase tracking-wider">Légende</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex items-center"><span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>PA : Phase aller</div>
                <div className="flex items-center"><span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>PB : Phase de classement</div>
                <div className="flex items-center"><span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>PC : Phase de maintien</div>
                <div className="flex items-center"><span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>TO : Total</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-24 pt-8 border-t border-white/5 text-center"
          variants={item}
        >
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">{federationHeader.league}</p>
          <p className="text-xs text-gray-600 mt-2">
            &copy; {new Date().getFullYear()} Tous droits réservés
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

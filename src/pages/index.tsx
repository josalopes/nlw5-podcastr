import { GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image';

import Head from 'next/head'
import { api } from '../../src/services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  description: string;
  url: string;
}

type Homeprops = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: Homeprops) {

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
          <ul>
            {latestEpisodes.map(episode => {
              return (
                <li key={episode.id}>
                  <Image 
                    width={192} 
                    height={192} 
                    objectFit="cover"
                    src={episode.thumbnail} 
                    alt={episode.title} 
                  />

                  <div className={styles.episodeDetails}>
                    <a href="">{episode.title}</a>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button">
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </li>
              )
            })}
          </ul>
      </section>

      <section className={styles.allEpisodes}>

      </section>
    </div>

  )
}

// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes?_limit=12&_sort=published_at&_order=desc');
//   const data = await response.json();

//   return {
//     props: {
//       episodes: data,
//     }
//   }
// }

export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });
  const data = await response.data;

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR}),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
      revalidate: 60 * 60 * 8,
    }
  }
}

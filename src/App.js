import logo from './logo.svg';
import './App.css';
import React, { useState,useEffect } from "react";
import Repositorys from './Repositorys';

function App() {
  const [username, setUsername] = useState("");
  const [tagHovered, setTagHovered] = useState("");
  const [repos, setRepos] = useState([]);
  const [user, setUser] = useState();
  const [traits, setTraits] = useState({"tag":[],"lang":[]});

  const RepoArgs = {
    repos,
    tagHovered,
    setTagHovered,
  }

  useEffect(() => {
    getTraits();
  }, [repos]);

  const fetchRepos = async (username) => {
    try {
      const token = process.env.REACT_APP_GITHUB_TOKEN;

      const userRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      if (!userRes.ok) throw new Error("Failed to fetch user data.");

      const user = await userRes.json();

      setUser(user);

      const res = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `token ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Failed to fetch repositories.");
      const repos = await res.json();
  
      const repoData = await Promise.all(
        repos.map(async (repo) => {
          // Fetch commits 1 by 1
          let commitsRes = await fetch(`${repo.commits_url.replace("{/sha}", "")}?per_page=1&page=1`, {
            headers: {
              Authorization: `token ${token}`,
            },
          });
          
          const linkHeader = commitsRes.headers.get("link");
          
          let totalCommits = 0;
          if (linkHeader) {
            const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (match) {
              totalCommits = parseInt(match[1], 10);
            }
          }
          
          //Fetch commits larger chunks
          commitsRes = await fetch(`${repo.commits_url.replace("{/sha}", "")}?per_page=50`, {
            headers: {
              Authorization: `token ${token}`,
            },
          });

          const commits = commitsRes.ok ? await commitsRes.json() : [];
          
          //Count contributors
          const uniqueContributors = new Set(
            commits.map((commit) => commit.author?.login).filter(Boolean)
          );
    
          const numContributors = uniqueContributors.size;

          //Fetch languages
          let languages = null;
          try {
            const response = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
              headers: {
                Authorization: `token ${token}`,
              },
            });
        
            if (!response.ok) throw new Error("Failed to fetch languages.");
        
            languages = await response.json();
          } catch (error) {
            console.error("Error fetching languages:", error);
          }
          
          
          // Determine tags
          const isTeamPlayer = numContributors > 2;
          const isBigProject = totalCommits > 100;
          const isWeekendProject = (() => {
            if (commits.length < 2) return false;
            const commitDates = commits.map(c => new Date(c.commit.author.date));
            commitDates.sort((a, b) => a - b);
            const dayDifferences = [];
            for (let i = 1; i < commitDates.length; i++) {
              const diff = (commitDates[i] - commitDates[i - 1]) / (1000 * 60 * 60 * 24);
              dayDifferences.push(diff);
            }
          
            // Calculate the average difference
            const averageDiff = dayDifferences.reduce((sum, diff) => sum + diff, 0) / dayDifferences.length;
          
            return averageDiff >= 7;
          })();
  

          return {
            name: repo.name,
            tags: [
              isTeamPlayer && "👥Team Player",
              isWeekendProject && "🏠Weekend Project",
              isBigProject && "🗃️Big Project",
            ].filter(Boolean),
            languages: languages,
            height: Math.random()*100
          };
        })
      );
      
      setRepos(repoData);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
  };

  const getTraits = ()=>{
    let count = {};
    let lang_count = {};
  
    repos.forEach(repo => {
      repo.tags.forEach(tag => {
        if(Object.keys(count).includes(tag)){
          count[tag] += 1;
        }
        else{
          count[tag] = 1;
        }
      });
      Object.keys(repo.languages).forEach(tag => {
        if(Object.keys(lang_count).includes(tag)){
          lang_count[tag] += 1;
        }
        else{
          lang_count[tag] = 1;
        }
      });
    });

    var traits_tag = Object.keys(count).map(function(key) {
      return [key, count[key]];
    });

    traits_tag.sort(function(first, second) {
      return second[1] - first[1];
    });

    traits_tag = traits_tag.map((e) => e[0]);
    traits_tag = traits_tag.slice(0, 5);

    var traits_lang = Object.keys(lang_count).map(function(key) {
      return [key, lang_count[key]];
    });

    traits_lang.sort(function(first, second) {
      return second[1] - first[1];
    });

    traits_lang = traits_lang.map((e) => e[0]);
    
    traits_lang = traits_lang.slice(0, 5);

    const res = {"tag": traits_tag, "lang": traits_lang};

    setTraits(res)
  }
  return (
    <div className='App'>
      <header>
        <h1>GitGood</h1>
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={()=>{fetchRepos(username)}}>Analyze</button>

        {
          user != null && (
          <div className='user-info'>
            <div className='user-avatar'>
              <img src={user.avatar_url} />
            </div>

            <div className='traits'>
              <div style={{display: 'flex', flexDirection: 'column',gap:5}}>
                {traits["tag"].map((trait_tag,index)=>(
                  <span style={{fontSize: Math.exp(5-index)*0.1+10}}>{trait_tag}</span>
                ))}
              </div>
              <div style={{display: 'flex', flexDirection: 'column',gap:5}}>
                {traits["lang"].map((trait_lang,index)=>(
                  <span style={{fontSize: Math.exp(5-index)*0.1+10}}>{trait_lang}</span>
                ))}
              </div>
            </div>
          </div>)
        }
      </header>

      <Repositorys {...RepoArgs}/>
    </div>
  );
}

export default App;

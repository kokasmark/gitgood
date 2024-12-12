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
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState({})

  const RepoArgs = {
    repos,
    tagHovered,
    setTagHovered,
    loading,
    colors
  }

  useEffect(() => {
    getTraits();
  }, [repos]);

  const fetchRepos = async (username) => {
    setLoading(true);
    const tags = {
      isTeamPlayer: { tag: "👥Team Player", desc: "Worked with 2 or more person." },
      isCommunityDriven: { tag: "🌐Community driven", desc: "Worked with 50 or more person." },
      isWeekendProject: { tag: "🏠Weekend Project", desc: "More comments on the weekend." },
      isBigProject: { tag: "🗃️Big Project", desc: "Total commits exceed 100." },
      isHobbyProject: { tag: "🎨Hobby Project", desc: "Total commits is under 25." },
      isStarryNight: { tag: "⭐Starry Night", desc: "More than 100 stars." },
      isLoneWolf: { tag: "🐺Lone Wolf", desc: "Worked alone." },
      isSpeedWriter: { tag: "⚡Speed Writer", desc: "Lot of commits in a short timespan." },
      isNocturnal: { tag: "🌒Night Owl", desc: "Majority of commits at night." },
      isFocused: { tag: "🎯Focused", desc: "Most of the commits in a short timespan." },
      isMultilingual: { tag: "💬Multilingual", desc: "More than 5 languages." },
      isActive: { tag: "🧑‍💻Active", desc: "Last update in a month." },
      isAbandoned: { tag: "🕸️Abandoned", desc: "No updates in half a year." },
      isLightweight: { tag: "🪶Lightweight", desc: "Smaller than 5mb." },
      isHeavyweight: { tag: "🏋️Heavyweight", desc: "Larger than 50mb." }
    };

    Object.keys(tags).forEach(key => {
      const newColor = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
      setColors(prevColors => ({ ...prevColors, [tags[key].tag]: newColor }));
    });
    let uniqueLanguages = [];
    try {
      const token = process.env.REACT_APP_API_KEY;
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

          //Fetch repo data
          const url = `https://api.github.com/repos/${username}/${repo.name}`;
          const response = await fetch(url, {
            headers: {
              Authorization: `token ${token}`,
            },
          });
      
          if (!response.ok) throw new Error("Failed to fetch repo data.");
      
          const repoData = await response.json();

          // Fetch commits 1 by 1
          let commitsRes = await fetch(`${repo.commits_url.replace("{/sha}", "")}?per_page=1&page=1`, {
            headers: {
              Authorization: `token ${token}`,
            },
          });
          
          var linkHeader = commitsRes.headers.get("link");
          
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
          
          //Fetch contributors
          
          let contribRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=1`, {
            headers: {
              Authorization: `token ${token}`,
            },
          });
          
          linkHeader = contribRes.headers.get("link");
          
          let totalContributors = 0;
          if (linkHeader) {
            const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (match) {
              totalContributors = parseInt(match[1], 10);
            }
          }

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
          const isTeamPlayer = totalContributors > 1;
          const isCommunityDriven = totalContributors > 50;
          const isLoneWolf = totalContributors == 0;
          const isBigProject = totalCommits > 100;
          const isWeekendProject = (() => {
            if (commits.length < 2) return false;
            let weekendCommits = 0;
            let weekdayCommits = 0;
          
            commits.forEach(c => {
              const day = new Date(c.commit.author.date).getDay();
              if (day === 0 || day === 6) {
                weekendCommits++;
              } else {
                weekdayCommits++; 
              }
            });
            
            // Return true if there are more weekend commits
            return weekendCommits > weekdayCommits;
          })();
          const isHobbyProject = totalCommits < 25;
          const isStarryNight =  (repoData.stargazers_count) > 50;
          const isSpeedWriter =(() => {
          if (commits.length < 2) return false;

          const commitsByDay = {};
          commits.forEach((c) => {
            const date = new Date(c.commit.author.date).toISOString().split("T")[0];
            if (!commitsByDay[date]) commitsByDay[date] = [];
            commitsByDay[date].push(new Date(c.commit.author.date));
          });
        
          for (const day in commitsByDay) {
            const dates = commitsByDay[day];
            if (dates.length < 2) continue;
        
            dates.sort((a, b) => a - b);
        
            const timeDifferences = [];
            for (let i = 1; i < dates.length; i++) {
              const diff = (dates[i] - dates[i - 1]) / (1000 * 60);
              timeDifferences.push(diff);
            }
        
            const avgDiff = timeDifferences.reduce((sum, d) => sum + d, 0) / timeDifferences.length;
            if (avgDiff <= 30) return true;
          }
        
          return false;
          })();
          const isNocturnal = (() => {
            if (commits.length === 0) return false;
            const commitHours = commits.map(c => new Date(c.commit.author.date).getHours());
            const avgHour = commitHours.reduce((sum, hour) => sum + hour, 0) / commitHours.length;
            return avgHour >= 20;
          })();
          const isFocused = (() => {
            if (commits.length < 2) return false;
            const commitTimes = commits.map(c => new Date(c.commit.author.date).getTime());
            commitTimes.sort((a, b) => a - b);
            const timeDifferences = [];
            for (let i = 1; i < commitTimes.length; i++) {
              const diff = (commitTimes[i] - commitTimes[i - 1]) / (1000 * 60); 
              timeDifferences.push(diff);
            }
            const averageDiff = timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length;
            return averageDiff <= 60;
          })();
          const isMultilingual = Object.keys(languages).length > 5; 
          const isActive = (() => {
            const lastUpdate = new Date(repo.updated_at); 
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return lastUpdate >= oneMonthAgo;
          })();  
          const isAbandoned = (() => {
            const lastUpdate = new Date(repo.updated_at); 
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return (lastUpdate < sixMonthsAgo) && isHobbyProject;
          })();
          const isLightweight = (() => {
            const sizeThreshold = 5000;
            return repoData.size < sizeThreshold;
          })(); 
          const isHeavyweight = (() => {
            const sizeThreshold = 50000;
            return repoData.size > sizeThreshold;
          })();

          Object.keys(languages).forEach(lang => {
            if (! Object.keys(colors).includes(lang)) {
              const newColor = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
              setColors(prevColors => ({ ...prevColors, [lang]: newColor }));
            }
          });
          return {
            name: repo.name,
            tags: [
                isTeamPlayer && tags.isTeamPlayer,
                isCommunityDriven && tags.isCommunityDriven,
                isWeekendProject && tags.isWeekendProject,
                isBigProject && tags.isBigProject,
                isHobbyProject && tags.isHobbyProject,
                isStarryNight && tags.isStarryNight,
                isLoneWolf && tags.isLoneWolf,
                isSpeedWriter && tags.isSpeedWriter,
                isNocturnal && tags.isNocturnal,
                isFocused && tags.isFocused,
                isMultilingual && tags.isMultilingual,
                isActive && tags.isActive,
                isAbandoned && tags.isAbandoned,
                isLightweight && tags.isLightweight,
                isHeavyweight && tags.isHeavyweight
            ].filter(Boolean),
            languages: languages,
            height: Math.random()*100,
            link:`${ repoData.html_url}`
          };
        })
      );
      
      setRepos(repoData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
  };

  const getTraits = ()=>{
    let count = {};
    let lang_count = {};
  
    repos.forEach(repo => {
      repo.tags.forEach(tag => {
        if(Object.keys(count).includes(tag.tag)){
          count[tag.tag] += 1;
        }
        else{
          count[tag.tag] = 1;
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
              <div className='profile-img'>
                <img src={user.avatar_url} />
                {loading && <div className='loader'></div>}
              </div>
            </div>

            <div className='traits' style={{display: loading ? "none" : "flex"}}>
              <div style={{display: 'flex', flexDirection: 'column',gap:5}}>
                {traits["tag"].map((trait_tag,index)=>(
                  <span className='tag' style={{backgroundColor: colors[trait_tag]}}
                  onMouseEnter={(e) => setTagHovered(trait_tag)}
                  onMouseLeave={(e) => setTagHovered("")}>{trait_tag}</span>
                ))}
              </div>
              <div style={{display: 'flex', flexDirection: 'column',gap:5}}>
                {traits["lang"].map((trait_lang,index)=>(
                  <span className='tag' style={{backgroundColor: colors[trait_lang]}}
                  onMouseEnter={(e) => setTagHovered(trait_lang)}
                  onMouseLeave={(e) => setTagHovered("")}>{trait_lang}</span>
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

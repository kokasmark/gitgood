import React, { useEffect, useRef } from 'react';
import Packery from 'packery';

const Repositorys = ({ repos, tagHovered,setTagHovered,loading,colors,tags }) => {
  const packeryRef = useRef(null);

  useEffect(() => {
    const packery = new Packery(packeryRef.current, {
      itemSelector: '.repo',
      gutter: 10,
    });

    setTimeout(() => {
        const packery = new Packery(packeryRef.current, {
            itemSelector: '.repo',
            gutter: 10,
          });
      
          // Re-layout after content changes
          return () => {
            packery.layout();
          };
    }, 500);

    // Re-layout after content changes
    return () => {
      packery.layout();
    };
  }, [repos]);

  const sortedRepos = [...repos].sort((a, b) => {
    const aHasTag = a.tags.some(tag => tag.tag === tagHovered) || Object.keys(a.languages).includes(tagHovered);
    const bHasTag = b.tags.some(tag => tag.tag === tagHovered) || Object.keys(b.languages).includes(tagHovered);
    return bHasTag-aHasTag; // Puts repos without the tag first
  });
  useEffect(() => {
    setTimeout(() => {
      const packery = new Packery(packeryRef.current, {
          itemSelector: '.repo',
          gutter: 10,
        });
    
        // Re-layout after content changes
        return () => {
          packery.layout();
        };
  }, 500);
  }, [sortedRepos]);
  const getIconName=(lang)=>{
    let iconName = lang.toLowerCase();

    const iconMap = {
      "html": "html5",
      "css": "css3",
      "vue": "vuejs",
      "c#": "csharp",
      "batchfile": "powershell",
      "shell": "powershell",
      "dockerfile": "docker",
      "scss" : "css4",
      "jupyter notebook": "jupyter",
      "c++":"cplusplus",
      "objective-c": "c",
      "makefile":"cmake"
    };
    
    iconName = Object.keys(iconMap).includes(iconName) ? iconMap[iconName] : iconName;
    return iconName;
  }

  return (
    <div ref={packeryRef} className="repos">
       {sortedRepos.map((repo, index) => (
          <div key={index} className={`repo 
            ${((!repo.tags.some(tag => tag.tag === tagHovered) && !Object.keys(repo.languages).includes(tagHovered)) && tagHovered != "") && "filtered-out"}
            ${loading && 'load'}`} 
          style={{animationDelay: `${(index/repos.length)*1}s`,minHeight: `${100+repo.height}px`}}>
            <a href={repo.link} target='blank' style={{margin: 0, marginTop: 10}}>{repo.name}</a>
            <div className='languages'>
              {repo.languages && Object.entries(repo.languages).map(([lang, bytes], langIndex) => (
                <span key={langIndex} className={`tag ${tagHovered == lang?'filter':""}`} 
                  style={{backgroundColor: "transparent", boxShadow: "none",
                  filter:"drop-shadow(2px 2px 2px #000)",
                  display: "flex",justifyContent:"center",alignItems: "center",
                  margin: "0px 0px 20px 0px"}}
                  onClick={(e) => setTagHovered(tagHovered != lang ? lang : "")}>

                 <img style={{width: 20, height: 20}}
                 src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${getIconName(lang)}/${getIconName(lang)}-original.svg`} 
                 onError={(e)=>e.target.parentNode.style.display = "none"}
                 />

                 <p className='desc' style={{backgroundColor: colors[lang],top: 10}}>{lang}</p>

                </span>
              ))}
            </div>
            <div className='tags'>
              {repo.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={`tag ${(tagHovered == tag.tag)&&'filter'}`} 
                style={{backgroundColor: colors[tag.tag]}}
                onClick={(e) => setTagHovered(tagHovered != tag.tag ? tag.tag : "")}>
                  {tag.tag}
                  <div className='desc'>{tag.desc}</div>
                </span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Repositorys;

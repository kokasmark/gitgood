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
  return (
    <div ref={packeryRef} className="repos">
       {sortedRepos.map((repo, index) => (
          <div key={index} className={`repo 
            ${((!repo.tags.some(tag => tag.tag === tagHovered) && !Object.keys(repo.languages).includes(tagHovered)) && tagHovered != "") && "filtered-out"}
            ${loading && 'load'}`} 
          style={{animationDelay: `${(index/repos.length)*0.5}s`,minHeight: `${100+repo.height}px`}}>
            <a href={repo.link} target='blank'>{repo.name}</a>
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
            <div className='languages'>
              {repo.languages && Object.entries(repo.languages).map(([lang, bytes], langIndex) => (
                <span key={langIndex} className={`tag ${(tagHovered == lang)&&'filter'}`} 
                style={{backgroundColor: colors[lang]}}
                onClick={(e) => setTagHovered(tagHovered != lang ? lang : "")}>
                {lang}</span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Repositorys;

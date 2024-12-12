import React, { useEffect, useRef } from 'react';
import Packery from 'packery';

const Repositorys = ({ repos, tagHovered,setTagHovered,loading }) => {
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


  return (
    <div ref={packeryRef} className="repos">
       {repos.map((repo, index) => (
          <a href={repo.link} key={index} className={`repo 
            ${((!repo.tags.some(tag => tag.tag === tagHovered) && !Object.keys(repo.languages).includes(tagHovered)) && tagHovered != "") && "filtered-out"}
            ${loading && 'load'}`} 
          style={{animationDelay: `${(index/repos.length)*0.5}s`,minHeight: `${100+repo.height}px`}}
          target='blank'>
            <h2>{repo.name}</h2>
            <div className='tags'>
              {repo.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={`tag ${(tagHovered == tag.tag)&&'filter'}`} 
                style={{backgroundColor: tag.color}}
                onMouseEnter={(e) => setTagHovered(tag.tag)}
                onMouseLeave={(e) => setTagHovered("")}>
                  {tag.tag}
                  <div className='desc'>{tag.desc}</div>
                </span>
              ))}
            </div>
            <div className='languages'>
              {repo.languages && Object.entries(repo.languages).map(([lang, bytes], langIndex) => (
                <span key={langIndex} className={`tag language ${(tagHovered == lang)&&'filter'}`} 
                style={{borderColor: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`}}
                onMouseEnter={(e) => setTagHovered(lang)}
                onMouseLeave={(e) => setTagHovered("")}>
                {lang}</span>
              ))}
            </div>
          </a>
        ))}
    </div>
  );
};

export default Repositorys;

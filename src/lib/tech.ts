import {
  siOpenjdk, siSpringboot, siSpringsecurity, siJsonwebtokens, siReact, siAngular, siFlutter, siDart, siElectron,
  siMysql, siHibernate, siDocker, siGit, siGithub, siSwagger,
} from 'simple-icons';

export interface Tech { id: string; name: string; path: string; hex: string }
const t = (id: string, name: string, i: { path: string; hex: string }): Tech => ({ id, name, path: i.path, hex: i.hex });

export const tech: Record<string, Tech> = {
  java: t('java', 'Java', siOpenjdk),
  springboot: t('springboot', 'Spring Boot', siSpringboot),
  security: t('security', 'Spring Security', siSpringsecurity),
  jwt: t('jwt', 'JWT', siJsonwebtokens),
  react: t('react', 'React', siReact),
  angular: t('angular', 'Angular', siAngular),
  flutter: t('flutter', 'Flutter', siFlutter),
  dart: t('dart', 'Dart', siDart),
  electron: t('electron', 'Electron', siElectron),
  mysql: t('mysql', 'MySQL', siMysql),
  hibernate: t('hibernate', 'Hibernate', siHibernate),
  swagger: t('swagger', 'Swagger', siSwagger),
  docker: t('docker', 'Docker', siDocker),
  git: t('git', 'Git', siGit),
  github: t('github', 'GitHub', siGithub),
};

export const stackGroups = [
  { id: 'backend', items: ['java', 'springboot', 'security', 'jwt'] },
  { id: 'web', items: ['react', 'angular'] },
  { id: 'mobile', items: ['flutter', 'dart'] },
  { id: 'desktop', items: ['electron'] },
  { id: 'data', items: ['mysql', 'hibernate', 'swagger', 'docker', 'git', 'github'] },
] as const;

export const geaStack = ['springboot', 'react', 'flutter', 'mysql', 'docker'];
export const farmStack = ['springboot', 'electron', 'mysql'];

import type { MDXComponents } from 'mdx/types';
import { Worked } from './worked';
import { Exercise } from './exercise';
import { Parsons } from './parsons';
import { Breaks, Callout, Checklist, JsBridge, Pre, Schema } from './prose';

/**
 * The allowlisted MDX vocabulary (plan R9). Lessons may only use these components;
 * anything else renders as an unknown-component error during development.
 */
export const mdxComponents: MDXComponents = {
  pre: Pre,
  Worked,
  Exercise,
  Parsons,
  JsBridge,
  Breaks,
  Callout,
  Schema,
  Checklist,
};

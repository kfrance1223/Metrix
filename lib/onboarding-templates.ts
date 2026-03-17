/**
 * lib/onboarding-templates.ts
 *
 * Static template definitions for the onboarding flow.
 * Each template represents a metric category with pre-configured submetrics.
 */

import type { UnitType, TrackingPeriod, AggregationType } from '@/types';

export interface SubmetricTemplate {
  name: string;
  unit_type: UnitType;
  unit_label: string | null;
  target_value: number;
  tracking_period: TrackingPeriod;
  aggregation_type: AggregationType;
  weight: number;
}

export interface MetricTemplate {
  name: string;
  color: string;
  weight: number;
  submetrics: SubmetricTemplate[];
}

export const ONBOARDING_TEMPLATES: MetricTemplate[] = [
  {
    name: 'Health & Fitness',
    color: '#f59e0b',
    weight: 25,
    submetrics: [
      { name: 'Exercise Hours', unit_type: 'time', unit_label: 'hrs', target_value: 1, tracking_period: 'daily', aggregation_type: 'sum', weight: 25 },
      { name: 'Steps', unit_type: 'number', unit_label: 'steps', target_value: 10000, tracking_period: 'daily', aggregation_type: 'sum', weight: 20 },
      { name: 'Sleep', unit_type: 'time', unit_label: 'hrs', target_value: 8, tracking_period: 'daily', aggregation_type: 'latest', weight: 25 },
      { name: 'Water', unit_type: 'number', unit_label: 'glasses', target_value: 8, tracking_period: 'daily', aggregation_type: 'sum', weight: 15 },
      { name: 'Meditation', unit_type: 'boolean', unit_label: null, target_value: 1, tracking_period: 'daily', aggregation_type: 'latest', weight: 15 },
    ],
  },
  {
    name: 'Finance',
    color: '#d97706',
    weight: 20,
    submetrics: [
      { name: 'Savings Rate', unit_type: 'percentage', unit_label: '%', target_value: 20, tracking_period: 'monthly', aggregation_type: 'latest', weight: 40 },
      { name: 'Budget Adherence', unit_type: 'percentage', unit_label: '%', target_value: 100, tracking_period: 'monthly', aggregation_type: 'latest', weight: 35 },
      { name: 'Investment Contributions', unit_type: 'currency', unit_label: '$', target_value: 500, tracking_period: 'monthly', aggregation_type: 'sum', weight: 25 },
    ],
  },
  {
    name: 'Career & Learning',
    color: '#92400e',
    weight: 20,
    submetrics: [
      { name: 'Deep Work', unit_type: 'time', unit_label: 'hrs', target_value: 4, tracking_period: 'daily', aggregation_type: 'sum', weight: 30 },
      { name: 'Learning Hours', unit_type: 'time', unit_label: 'hrs', target_value: 5, tracking_period: 'weekly', aggregation_type: 'sum', weight: 25 },
      { name: 'Tasks Completed', unit_type: 'number', unit_label: 'tasks', target_value: 5, tracking_period: 'daily', aggregation_type: 'sum', weight: 25 },
      { name: 'Networking', unit_type: 'number', unit_label: 'contacts', target_value: 3, tracking_period: 'weekly', aggregation_type: 'sum', weight: 20 },
    ],
  },
  {
    name: 'Relationships',
    color: '#fbbf24',
    weight: 15,
    submetrics: [
      { name: 'Quality Time', unit_type: 'time', unit_label: 'hrs', target_value: 2, tracking_period: 'daily', aggregation_type: 'sum', weight: 40 },
      { name: 'Social Outings', unit_type: 'number', unit_label: 'outings', target_value: 2, tracking_period: 'weekly', aggregation_type: 'sum', weight: 35 },
      { name: 'Acts of Kindness', unit_type: 'number', unit_label: 'acts', target_value: 1, tracking_period: 'daily', aggregation_type: 'sum', weight: 25 },
    ],
  },
  {
    name: 'Personal Growth',
    color: '#78350f',
    weight: 20,
    submetrics: [
      { name: 'Reading', unit_type: 'time', unit_label: 'mins', target_value: 30, tracking_period: 'daily', aggregation_type: 'sum', weight: 30 },
      { name: 'Journaling', unit_type: 'boolean', unit_label: null, target_value: 1, tracking_period: 'daily', aggregation_type: 'latest', weight: 25 },
      { name: 'Creative Projects', unit_type: 'time', unit_label: 'hrs', target_value: 3, tracking_period: 'weekly', aggregation_type: 'sum', weight: 25 },
      { name: 'Screen Time', unit_type: 'time', unit_label: 'hrs', target_value: 3, tracking_period: 'daily', aggregation_type: 'latest', weight: 20 },
    ],
  },
];

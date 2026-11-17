import { describe, expect, it } from 'vitest'

import { getUserIntent } from '@/utilities/getUserIntent'

const keywordQueries = [
  'red dress for women',
  'blue jeans with stretch',
  'top handle bag',
  'best sellers',
  'nike air max',
  'wool coat',
  'leather jacket men',
  'summer style guide',
  'outfit builder',
  'black boots size 9',
  'running shoes',
  'coordinate set',
  'look book',
  'linen shirt',
  'under armour hoodie',
  'over the knee boots',
  'what a wonderful world tee',
  'cashmere scarf navy',
  'sale',
  'new in',
]

const conversationalQueries = [
  'do you have shoes?',
  'what should i wear to a wedding',
  'something like this jacket but cheaper',
  "i'm looking for a gift",
  "i'm interested in wool coats",
  "what's the difference between these",
  "i'd like to know about sizing",
  'can you recommend a coat',
  'help me pick a bag',
  'show me something similar to this',
  'what goes with a navy blazer',
  'i need a dress for a summer wedding',
  'style me for a dinner party',
  'which one should i buy',
  'a shirt that matches my grey trousers',
]

describe('getUserIntent', () => {
  describe('keyword searches', () => {
    it.each(keywordQueries)('treats "%s" as a keyword search', (query) => {
      expect(getUserIntent(query)).toBe(false)
    })
  })

  describe('conversational queries', () => {
    it.each(conversationalQueries)('treats "%s" as conversational', (query) => {
      expect(getUserIntent(query)).toBe(true)
    })
  })

  describe('normalisation', () => {
    it('matches smart apostrophes the same as straight ones', () => {
      expect(getUserIntent('i’m interested in wool coats')).toBe(
        getUserIntent("i'm interested in wool coats"),
      )
      expect(getUserIntent('what’s the difference')).toBe(true)
    })

    it('is case insensitive', () => {
      expect(getUserIntent('Can You Recommend A Coat')).toBe(true)
    })

    it('ignores surrounding whitespace', () => {
      expect(getUserIntent('   wool coat   ')).toBe(false)
    })
  })

  describe('question marks', () => {
    it('detects a question mark anywhere in the query', () => {
      expect(getUserIntent('red dress?')).toBe(true)
      expect(getUserIntent('shoes?')).toBe(true)
    })
  })

  describe('numeric filter requests', () => {
    it.each([
      'handbag under 100',
      'dresses under $50',
      'coats over 200',
      'bags below 75',
      'shoes around 90',
      'jackets between 100 and 300',
      'sneakers max 150',
    ])('treats "%s" as a filter request', (query) => {
      expect(getUserIntent(query)).toBe(true)
    })

    it.each([
      'under armour hoodie',
      'over the knee boots',
      'within reach collection',
      'around the world print',
    ])('does not treat "%s" as a filter request', (query) => {
      expect(getUserIntent(query)).toBe(false)
    })
  })

  describe('word boundaries', () => {
    it('does not match a phrase inside a longer word', () => {
      expect(getUserIntent('vsco cam tee')).toBe(false)
      expect(getUserIntent('mypad case')).toBe(false)
    })
  })

  describe('sentence-length fallback', () => {
    it('treats a long query with no trigger phrase as conversational', () => {
      expect(
        getUserIntent('navy wool overcoat double breasted notch lapel knee length'),
      ).toBe(true)
    })

    it('does not apply the ratio check to short queries', () => {
      expect(getUserIntent('the a')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('returns false for an empty query', () => {
      expect(getUserIntent('')).toBe(false)
      expect(getUserIntent('   ')).toBe(false)
    })
  })
})

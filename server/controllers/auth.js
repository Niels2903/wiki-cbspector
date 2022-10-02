/* global WIKI */

const express = require('express')
const ExpressBrute = require('express-brute')
const BruteKnex = require('../helpers/brute-knex')
const router = express.Router()
const moment = require('moment')
const _ = require('lodash')
const path = require('path')

const bruteforce = new ExpressBrute(new BruteKnex({
  createTable: true,
  knex: WIKI.db.knex
}), {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  failCallback: (req, res, next) => {
    res.status(401).send('Too many failed attempts. Try again later.')
  }
})

/**
 * Login form
 */
router.get('/login', async (req, res, next) => {
  // -> Bypass Login
  if (WIKI.config.auth.autoLogin && !req.query.all) {
    const stg = await WIKI.db.authentication.query().orderBy('order').first()
    const stgInfo = _.find(WIKI.data.authentication, ['key', stg.strategyKey])
    if (!stgInfo.useForm) {
      return res.redirect(`/login/${stg.key}`)
    }
  }
  // -> Show Login
  res.sendFile(path.join(WIKI.ROOTPATH, 'assets/index.html'))
})

/**
 * Social Strategies Login
 */
router.get('/login/:strategy', async (req, res, next) => {
  try {
    await WIKI.db.users.login({
      strategy: req.params.strategy
    }, { req, res })
  } catch (err) {
    next(err)
  }
})

/**
 * Social Strategies Callback
 */
router.all('/login/:strategy/callback', async (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'POST') { return next() }

  try {
    const authResult = await WIKI.db.users.login({
      strategy: req.params.strategy
    }, { req, res })
    res.cookie('jwt', authResult.jwt, { expires: moment().add(1, 'y').toDate() })

    const loginRedirect = req.cookies['loginRedirect']
    if (loginRedirect === '/' && authResult.redirect) {
      res.clearCookie('loginRedirect')
      res.redirect(authResult.redirect)
    } else if (loginRedirect) {
      res.clearCookie('loginRedirect')
      res.redirect(loginRedirect)
    } else if (authResult.redirect) {
      res.redirect(authResult.redirect)
    } else {
      res.redirect('/')
    }
  } catch (err) {
    next(err)
  }
})

/**
 * Logout
 */
router.get('/logout', async (req, res, next) => {
  const redirURL = await WIKI.db.users.logout({ req, res })
  req.logout((err) => {
    if (err) { return next(err) }
    res.clearCookie('jwt')
    res.redirect(redirURL)
  })
})

/**
 * Register form
 */
router.get('/register', async (req, res, next) => {
  _.set(res.locals, 'pageMeta.title', 'Register')
  const localStrg = await WIKI.db.authentication.getStrategy('local')
  if (localStrg.selfRegistration) {
    res.sendFile(path.join(WIKI.ROOTPATH, 'assets/index.html'))
  } else {
    next(new WIKI.Error.AuthRegistrationDisabled())
  }
})

/**
 * Verify
 */
router.get('/verify/:token', bruteforce.prevent, async (req, res, next) => {
  try {
    const usr = await WIKI.db.userKeys.validateToken({ kind: 'verify', token: req.params.token })
    await WIKI.db.users.query().patch({ isVerified: true }).where('id', usr.id)
    req.brute.reset()
    if (WIKI.config.auth.enforce2FA) {
      res.redirect('/login')
    } else {
      const result = await WIKI.db.users.refreshToken(usr)
      res.cookie('jwt', result.token, { expires: moment().add(1, 'years').toDate() })
      res.redirect('/')
    }
  } catch (err) {
    next(err)
  }
})

/**
 * Reset Password
 */
router.get('/login-reset/:token', bruteforce.prevent, async (req, res, next) => {
  try {
    const usr = await WIKI.db.userKeys.validateToken({ kind: 'resetPwd', token: req.params.token })
    if (!usr) {
      throw new Error('Invalid Token')
    }
    req.brute.reset()

    const changePwdContinuationToken = await WIKI.db.userKeys.generateToken({
      userId: usr.id,
      kind: 'changePwd'
    })
    const bgUrl = !_.isEmpty(WIKI.config.auth.loginBgUrl) ? WIKI.config.auth.loginBgUrl : '/_assets/img/splash/1.jpg'
    res.render('login', { bgUrl, hideLocal: WIKI.config.auth.hideLocal, changePwdContinuationToken })
  } catch (err) {
    next(err)
  }
})

/**
 * JWT Public Endpoints
 */
router.get('/.well-known/jwk.json', function (req, res, next) {
  res.json(WIKI.config.certs.jwk)
})
router.get('/.well-known/jwk.pem', function (req, res, next) {
  res.send(WIKI.config.certs.public)
})

module.exports = router

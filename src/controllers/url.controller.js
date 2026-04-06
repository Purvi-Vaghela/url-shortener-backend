import URL from "../models/url.model.js";
import generateShortCode from "../utils/generateShortCode.js";
import redis from "../config/redis.js";

export const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "URL is required" });
    }

    let shortCode = generateShortCode();

    // Handle collision
    let existing = await URL.findOne({ shortCode });

    while (existing) {
      shortCode = generateShortCode();
      existing = await URL.findOne({ shortCode });
    }

    await URL.create({
      originalUrl,
      shortCode,
      user: req.user?.id || null,
    });

    // Cache the new URL
    await redis.set(shortCode, originalUrl).catch(err => {
      console.error("Redis cache error:", err);
    });

    const baseUrl = process.env.BASE_URL;

    res.status(201).json({
      shortUrl: `${baseUrl}/${shortCode}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Check cache first
    const cachedUrl = await redis.get(shortCode);
    if (cachedUrl) {
      // Update clicks in the background
      URL.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } }).exec();
      return res.redirect(cachedUrl);
    }

    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Cache the URL for future requests
    await redis.set(shortCode, url.originalUrl);

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyUrls = async (req, res) => {
  try {
    const urls = await URL.find({ user: req.user.id });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const urlId = req.params.id;
    const url = await URL.findById(urlId);

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    if (url.user && url.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await URL.findByIdAndDelete(urlId);
    res.json({ message: "URL removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
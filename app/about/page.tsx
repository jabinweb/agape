import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Palette, Heart, Lightbulb, Award, ArrowRight, Calendar, MapPin, Link, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
     
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/1647219/pexels-photo-1647219.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Artist studio"
            fill
            priority
            className="object-cover object-center"
            style={{ opacity: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-400/30 dark:text-blue-100">
              Atelier 7X • About the Artist
            </div>
            <h1 className="font-display text-5xl !leading-[1.5em] md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 dark:from-blue-300 dark:via-purple-300 dark:to-orange-300">
              How it all began…
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              A journey of self-discovery through the transformative power of art
            </p>
          </div>
        </div>
      </section>

      {/* Artist Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
              {/* Image with decorative elements */}
              <div className="mb-12 lg:mb-0 lg:w-1/2 relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src="https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Artist at work"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full z-[-1]"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-full z-[-1]"></div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6 font-display relative">
                  The Artist&apos;s Journey
                  <span className="absolute bottom-0 left-0 h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500"></span>
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed">
                    Welcome to my creative journey! As a <span className="font-semibold text-blue-600 dark:text-blue-400">self-taught artist</span>, I thrive on 
                    experimentation across various mediums. My artistic path began during a 
                    profound midlife crisis, where I grappled with questions about the purpose 
                    of life and my true calling.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    After a series of transformative events, I finally embraced my lifelong dream of 
                    painting and sketching, leading me to discover my passion for visual art. 
                    Each piece I create reflects not only my experiences but also my desire to 
                    evoke emotion and provoke thought.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    Join me as I push boundaries and invite you to explore the beauty of 
                    creativity in all its forms!
                  </p>
                </div>
                
                <div className="mt-8 flex items-center space-x-4">
                  <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 border border-blue-200 dark:border-blue-700">
                    View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full border-2 border-gray-400 dark:border-white dark:text-white dark:hover:bg-white/20 dark:hover:text-white">
                    Contact Me
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Approach */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-950 dark:to-blue-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="h-px w-8 bg-blue-500"></span>
              <span className="mx-3 text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Core Values</span>
              <span className="h-px w-8 bg-blue-500"></span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              My Artistic Philosophy
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every brushstroke is guided by these core principles that shape my creative process
              and define my artistic identity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-t-blue-500 rounded-xl">
              <CardContent className="p-8 space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-inner">
                  <Heart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-2xl mt-6">Emotional Depth</h3>
                <Separator className="w-12 mx-auto bg-blue-200 dark:bg-blue-800" />
                <p className="text-muted-foreground">
                  Every painting carries the weight of genuine emotion, born from real experiences and profound moments.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-t-purple-500 rounded-xl">
              <CardContent className="p-8 space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-inner">
                  <Lightbulb className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-2xl mt-6">Creative Freedom</h3>
                <Separator className="w-12 mx-auto bg-purple-200 dark:bg-purple-800" />
                <p className="text-muted-foreground">
                  Self-taught and unbound by traditional rules, I explore new techniques and push artistic boundaries.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-t-orange-500 rounded-xl">
              <CardContent className="p-8 space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/20 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-inner">
                  <Palette className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-2xl mt-6">Medium Mastery</h3>
                <Separator className="w-12 mx-auto bg-orange-200 dark:bg-orange-800" />
                <p className="text-muted-foreground">
                  From oils to acrylics, watercolors to mixed media—each medium offers unique possibilities to explore.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-t-green-500 rounded-xl">
              <CardContent className="p-8 space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-inner">
                  <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-2xl mt-6">Authentic Expression</h3>
                <Separator className="w-12 mx-auto bg-green-200 dark:bg-green-800" />
                <p className="text-muted-foreground">
                  Each piece is a genuine expression of my journey, unfiltered and true to the moment of creation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Creative Process */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center mb-4">
                  <span className="h-px w-8 bg-purple-500"></span>
                  <span className="mx-3 text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Behind the Canvas</span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                  The Creative Process
                </h2>
                <p className="text-lg leading-relaxed mb-8">
                  Art is not just about the final piece—it&apos;s about the journey of discovery, 
                  the moments of breakthrough, and the quiet hours of contemplation that shape 
                  each work. My studio is a sanctuary where emotions transform into colors, 
                  thoughts become textures, and stories unfold through every brushstroke.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">Inspiration</h3>
                      <p className="text-muted-foreground">Finding the spark in everyday moments, nature, music, and personal experiences.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-1">
                      <span className="font-bold text-purple-600 dark:text-purple-400">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">Exploration</h3>
                      <p className="text-muted-foreground">Sketching concepts, testing color palettes, and experimenting with techniques.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mt-1">
                      <span className="font-bold text-orange-600 dark:text-orange-400">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">Creation</h3>
                      <p className="text-muted-foreground">Bringing the vision to life through intuitive expression and technical skill.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 transform rotate-3">
                  <Image 
                    src="https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Art process" 
                    width={300}
                    height={400}
                    className="rounded-lg shadow-xl transform -rotate-6 object-cover aspect-[3/4]"
                  />
                  <Image 
                    src="https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Paint brushes" 
                    width={300}
                    height={400}
                    className="rounded-lg shadow-xl transform rotate-6 object-cover aspect-[3/4] mt-8"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full z-[-1]"></div>
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-full z-[-1]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white/70 dark:bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(80,80,180,0.12)] rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                  Original Artworks
                </p>
              </div>
              
              <div className="text-center p-8 bg-white/70 dark:bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(80,80,180,0.12)] rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">5</div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                  Years Creating
                </p>
              </div>
              
              <div className="text-center p-8 bg-white/70 dark:bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(80,80,180,0.12)] rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">∞</div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                  Stories to Tell
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Let&apos;s Connect
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Interested in commissioning a piece, featuring my work in your gallery, 
              or just want to chat about art? I&apos;d love to hear from you.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="rounded-full px-8 bg-white text-blue-700 hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700" size="lg">
                Contact Me <Mail className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full px-8 border-2 border-gray-400 dark:border-white dark:text-white dark:hover:bg-white/20" size="lg">
                Visit Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Los Angeles, CA</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@atelier7x.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link className="h-4 w-4" />
                <span>@atelier7x</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}